import axios from '@data-fair/lib-node/axios.js'
import axiosWithCookies from '@data-fair/lib-node/axios-with-cookies.js'
import type { AxiosInstance } from 'axios'
import * as cheerio from 'cheerio'
import { Histogram, register } from 'prom-client'
import config from '#config'
import mongo from '#mongo'
import es from '#es'
import type { Portal } from '#types/portal/index.js'
import type { Page } from '#types/page/index.js'
import type { Reuse } from '#types/reuse/index.js'
import type { SearchPage } from '@data-fair/types-portals/index.ts'
import { indexDefinition } from './es.ts'
import debugModule from 'debug'

const debug = debugModule('search-pages')

const indexingDelayHistogram = new Histogram({
  name: 'search_page_indexing_delay_seconds',
  help: 'Delay between lastUpdate and indexedAt for search pages',
  buckets: [0, 1, 5, 10, 30, 60, 300, 600, 1800, 3600],
  labelNames: ['portal'],
  registers: [register]
})

const newIndexName = (portalId: string) => `${aliasName(portalId)}--${Date.now()}`
const aliasName = (portalId: string) => `portal-search-${portalId}`

export type CreateSearchPageParams = {
  portal: string
  owner: SearchPage['owner']
  resource: SearchPage['resource']
  path?: string
  public?: boolean
  privateAccess?: SearchPage['privateAccess']
  indexingStatus?: 'toIndex' | 'toDelete'
}

export const createOrUpdateSearchPage = async (params: CreateSearchPageParams): Promise<void> => {
  const refId = `${params.portal}-${params.resource.type}-${params.resource.id}`

  const updateFields: Record<string, any> = {
    owner: params.owner,
    portal: params.portal,
    resource: params.resource,
    public: params.public,
    privateAccess: params.privateAccess,
    indexingStatus: params.indexingStatus || 'toIndex',
    lastUpdate: new Date()
  }

  if (params.path) {
    updateFields.path = params.path
  }

  await mongo.searchPages.updateOne(
    { _id: refId },
    { $set: updateFields },
    { upsert: true }
  )
}

export const deleteSearchPage = async (
  portalId: string,
  resourceType: SearchPage['resource']['type'],
  resourceId: string
): Promise<void> => {
  const refId = `${portalId}-${resourceType}-${resourceId}`

  await mongo.searchPages.updateOne(
    { _id: refId },
    { $set: { indexingStatus: 'toDelete' } }
  )
}

export const reindexPage = async (page: Page, portalId: string): Promise<void> => {
  const portal = await mongo.portals.findOne({ _id: portalId }) as Portal | null
  if (!portal || !portal.config.searchEngine?.active) return

  const searchTypes = portal.config.searchEngine.types || []
  if (!searchTypes.includes('page')) return

  const path = getPagePath(page)
  if (!path) return

  await createOrUpdateSearchPage({
    portal: portalId,
    owner: page.owner,
    resource: { type: 'page', id: page._id },
    path,
    public: true
  })
}

export const reindexReuse = async (reuse: Reuse, portalId: string): Promise<void> => {
  const portal = await mongo.portals.findOne({ _id: portalId }) as Portal | null
  if (!portal || !portal.config.searchEngine?.active) return

  const searchTypes = portal.config.searchEngine.types || []
  if (!searchTypes.includes('reuse')) return

  const path = `/reuses/${reuse.slug || reuse._id}`

  await createOrUpdateSearchPage({
    portal: portalId,
    owner: reuse.owner,
    resource: { type: 'reuse', id: reuse._id },
    path,
    public: true
  })
}

const getPortalUrl = async (portal: Portal): Promise<string> => {
  return portal.ingress?.url || config.portalUrlPattern.replace('{subdomain}', portal._id)
}

const createPseudoSession = async (owner: SearchPage['owner']): Promise<AxiosInstance> => {
  const ax = axiosWithCookies({
    globalCookies: true,
    cookiesOrigin: config.privateDirectoryUrl
  })
  await ax.post(
    `${config.privateDirectoryUrl}/api/auth/pseudo`,
    { type: owner.type, id: owner.id },
    { headers: { 'x-secret-key': config.secretKeys.pseudoSession } }
  )
  return ax
}

const getPagePath = (page: Page): string | undefined => {
  const pageConfig = page.config as any
  switch (page.type) {
    case 'event':
      if (pageConfig.eventMetadata?.slug) {
        return `/events/${pageConfig.eventMetadata.slug}`
      }
      break
    case 'news':
      if (pageConfig.newsMetadata?.slug) {
        return `/news/${pageConfig.newsMetadata.slug}`
      }
      break
    case 'generic':
      if (pageConfig.genericMetadata?.slug) {
        if (pageConfig.group?.slug) {
          return `/groups/${pageConfig.group.slug}/pages/${pageConfig.genericMetadata.slug}`
        }
        return `/pages/${pageConfig.genericMetadata.slug}`
      }
      break
    default:
      if (page.type === 'home') return '/'
      if (['contact', 'privacy-policy', 'accessibility', 'legal-notice', 'cookie-policy', 'terms-of-service'].includes(page.type)) {
        return `/${page.type}`
      }
  }
  return undefined
}

export const initSearchEngine = async (portal: Portal): Promise<void> => {
  if (!portal.config.searchEngine?.active) return

  const searchTypes = portal.config.searchEngine.types || ['dataset', 'application', 'page', 'reuse']
  const index = newIndexName(portal._id)
  const alias = aliasName(portal._id)

  await es.client.indices.create(indexDefinition(portal, index))

  // TODO: only switch alias and delete old index when the worker has finished indexing the pages ?
  let existingAlias
  try {
    existingAlias = await es.client.indices.getAlias({ name: alias })
  } catch (err: any) {
    if (err.statusCode !== 404) throw err
  }

  const actions = []
  if (existingAlias) {
    for (const existingIndex of Object.keys(existingAlias)) {
      actions.push({ remove: { alias, index: existingIndex } })
      await es.client.indices.delete({ index: existingIndex })
    }
  }
  actions.push({ add: { alias, index } })

  debug(`switch dataset index alias ${alias} -> ${index}`)
  await es.client.indices.updateAliases({ actions, timeout: '60s' })

  const searchPages: SearchPage[] = []

  if (searchTypes.includes('page')) {
    const pagesCursor = mongo.pages.find({
      'owner.type': portal.owner.type,
      'owner.id': portal.owner.id,
      portals: portal._id
    })

    for await (const page of pagesCursor) {
      const path = getPagePath(page)
      if (!path) continue

      searchPages.push({
        _id: `${portal._id}-page-${(page as Page)._id}`,
        owner: portal.owner,
        portal: portal._id,
        resource: { type: 'page', id: (page as Page)._id },
        path,
        indexingStatus: 'toIndex'
      })
    }
  }

  if (searchTypes.includes('reuse')) {
    const reusesCursor = mongo.reuses.find({
      'owner.type': portal.owner.type,
      'owner.id': portal.owner.id,
      portals: portal._id
    })

    for await (const reuse of reusesCursor) {
      searchPages.push({
        _id: `${portal._id}-reuse-${(reuse)._id}`,
        owner: portal.owner,
        portal: portal._id,
        resource: { type: 'reuse', id: (reuse)._id },
        path: `/reuses/${(reuse as Reuse).slug || (reuse)._id}`,
        indexingStatus: 'toIndex'
      })
    }
  }

  if (searchTypes.includes('dataset') || searchTypes.includes('application')) {
    const portalUrl = await getPortalUrl(portal)
    const axiosInstance = await createPseudoSession(portal.owner)

    if (searchTypes.includes('dataset')) {
      try {
        let page = 1
        let hasMore = true
        while (hasMore) {
          const datasetsResponse = await axiosInstance.get(`${portalUrl}/data-fair/api/v1/datasets`, {
            params: {
              size: 20,
              page,
              select: 'id,slug',
              publicationSites: `data-fair-portals:${portal._id}`
            }
          })

          for (const dataset of datasetsResponse.data.results || []) {
            if (!dataset.slug) continue
            searchPages.push({
              _id: `${portal._id}-dataset-${dataset.id}`,
              owner: portal.owner,
              portal: portal._id,
              resource: { type: 'dataset', id: dataset.id },
              path: `/datasets/${dataset.slug}`,
              indexingStatus: 'toIndex'
            })
          }

          hasMore = datasetsResponse.data.results && datasetsResponse.data.results.length === 20
          page++
        }
      } catch (err) {
        console.error('Error fetching datasets for search indexing:', err)
      }
    }

    if (searchTypes.includes('application')) {
      try {
        let page = 1
        let hasMore = true
        while (hasMore) {
          const applicationsResponse = await axiosInstance.get(`${portalUrl}/data-fair/api/v1/applications`, {
            params: {
              size: 20,
              page,
              select: 'id,slug',
              publicationSites: `data-fair-portals:${portal._id}`
            }
          })

          for (const application of applicationsResponse.data.results || []) {
            if (!application.slug) continue
            searchPages.push({
              _id: `${portal._id}-application-${application.id}`,
              owner: portal.owner,
              portal: portal._id,
              resource: { type: 'application', id: application.id },
              path: `/applications/${application.slug}`,
              indexingStatus: 'toIndex'
            })
          }

          hasMore = applicationsResponse.data.results && applicationsResponse.data.results.length === 20
          page++
        }
      } catch (err) {
        console.error('Error fetching applications for search indexing:', err)
      }
    }
  }

  await mongo.searchPages.deleteMany({ portal: portal._id })
  if (searchPages.length > 0) {
    await mongo.searchPages.insertMany(searchPages)
  }
}

export const deleteSearchEngine = async (portal: Portal) => {
  const name = aliasName(portal._id)
  let existingAlias
  try {
    existingAlias = await es.client.indices.getAlias({ name })
  } catch (err: any) {
    if (err.statusCode !== 404) throw err
  }

  if (existingAlias) {
    await es.client.indices.deleteAlias({ name, index: '*' })
    for (const existingIndex of Object.keys(existingAlias)) {
      await es.client.indices.delete({ index: existingIndex })
    }
  }
}

export const indexSearchPage = async (searchPage: SearchPage): Promise<void> => {
  const portal = await mongo.portals.findOne({ _id: searchPage.portal }) as Portal | null
  if (!portal) throw new Error(`Portal not found: ${searchPage.portal}`)
  const portalUrl = await getPortalUrl(portal)
  const headers: Record<string, string> = {
    'x-forwarded-host': new URL(portalUrl).host
  }

  let axiosInstance: AxiosInstance

  if (searchPage.public) {
    axiosInstance = axios
  } else {
    axiosInstance = await createPseudoSession(searchPage.owner)
  }

  const url = `${portalUrl}${searchPage.path}`

  debug('indexSearchPage url: ', url)

  const response = await axiosInstance.get(url, { headers })
  const etag = response.headers['etag'] as string | undefined

  if (!etag) {
    console.warn('No ETag in response for', url, '- forcing indexing')
  }

  const storedPage = await mongo.searchPages.findOne({ _id: searchPage._id })

  const etagChanged = !etag || storedPage?.etag !== etag
  const visibilityChanged =
    storedPage?.public !== searchPage.public ||
    JSON.stringify(storedPage?.privateAccess) !== JSON.stringify(searchPage.privateAccess)

  if (!etagChanged && !visibilityChanged) {
    debug('Skipping indexing for', searchPage._id, '- etag and visibility unchanged')
    return
  }

  const html = response.data as string

  const $ = cheerio.load(html)

  const selectorsToRemove = ['.v-app-bar']
  for (const selector of selectorsToRemove) {
    $(selector).remove()
  }

  const title = $('title').text().trim()
  const description = $('meta[name="description"]').attr('content') || ''
  const text = $('body').text().replace(/\s+/g, ' ').trim()

  const privateAccessStrings = (searchPage.privateAccess || []).map(access => {
    let id: string
    if (access.type === 'user') {
      if (!access.id && !access.email) {
        throw new Error('privateAccess user must have id or email')
      }
      id = access.id || `email:${access.email}`
    } else {
      if (!access.id) {
        throw new Error('privateAccess organization must have id')
      }
      id = access.id
    }
    const department = access.department || '*'
    const role = access.role || '*'
    return `${access.type}:${id}:${department}:${role}`
  })

  const searchDoc = {
    title,
    description,
    text,
    path: searchPage.path,
    resourceType: searchPage.resource.type,
    resourceId: searchPage.resource.id,
    public: searchPage.public,
    privateAccess: privateAccessStrings,
    owner: searchPage.owner,
    portal: searchPage.portal
  }

  await es.client.index({
    index: aliasName(searchPage.portal),
    id: searchPage._id,
    document: searchDoc
  })

  const indexedAt = new Date().toISOString()

  if (storedPage?.lastUpdate) {
    const delaySeconds = (new Date(indexedAt).getTime() - new Date(storedPage.lastUpdate).getTime()) / 1000
    indexingDelayHistogram.labels({ portal: searchPage.portal }).observe(delaySeconds)
  }

  await mongo.searchPages.updateOne(
    { _id: searchPage._id },
    { $set: { etag, indexedAt } }
  )
}

export const deleteIndexedSearchPage = async (ref: SearchPage): Promise<void> => {
  try {
    await es.client.delete({
      index: aliasName(ref.portal),
      id: ref._id
    })
  } catch (err: any) {
    if (err.meta?.statusCode !== 404) {
      throw err
    }
  }
}
