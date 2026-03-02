import axios from '@data-fair/lib-node/axios.js'
import axiosWithCookies from '@data-fair/lib-node/axios-with-cookies.js'
import type { AxiosInstance } from 'axios'
import * as cheerio from 'cheerio'
import config from '#config'
import mongo from '#mongo'
import es from '#es'
import type { Portal } from '#types/portal/index.js'
import type { Page } from '#types/page/index.js'
import type { Reuse } from '#types/reuse/index.js'
import type { SearchPage } from '@data-fair/types-portals/index.ts'
import { indexDefinition } from './es.ts'

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
    indexingStatus: params.indexingStatus || 'toIndex'
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

const getPortalUrl = async (portalId: string): Promise<string> => {
  const portal = await mongo.portals.findOne({ _id: portalId }) as Portal | null
  if (!portal) {
    throw new Error(`Portal not found: ${portalId}`)
  }
  return portal.ingress?.url || config.portalUrlPattern.replace('{subdomain}', portalId)
}

const createPseudoSession = async (owner: SearchPage['owner']): Promise<AxiosInstance> => {
  const ax = axiosWithCookies({ globalCookies: true })
  await ax.post(
    `${config.privateDirectoryUrl}/api/auth/pseudo?key=${config.secretKeys.pseudoSession}`,
    { type: owner.type, id: owner.id }
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

  try {
    await es.client.indices.putAlias({ index, name: alias })
  } catch (err: any) {
    if (err.meta?.body?.error?.type !== 'resource_already_exists_exception') {
      throw err
    }
  }

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
    const portalUrl = await getPortalUrl(portal._id)
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

  if (searchPages.length > 0) {
    await mongo.searchPages.insertMany(searchPages)
  }
}

export const indexPageRef = async (ref: SearchPage): Promise<void> => {
  const portalUrl = await getPortalUrl(ref.portal)
  const headers: Record<string, string> = {
    'x-forwarded-host': new URL(portalUrl).host
  }

  let axiosInstance: AxiosInstance

  if (ref.public) {
    axiosInstance = axios
  } else {
    axiosInstance = await createPseudoSession(ref.owner)
  }

  const url = `${portalUrl}${ref.path}`

  const response = await axiosInstance.get(url, { headers })
  const html = response.data as string

  const $ = cheerio.load(html)

  const selectorsToRemove = ['.v-app-bar']
  for (const selector of selectorsToRemove) {
    $(selector).remove()
  }

  const title = $('title').text().trim()
  const description = $('meta[name="description"]').attr('content') || ''
  const text = $('body').text().replace(/\s+/g, ' ').trim()

  const privateAccessStrings = (ref.privateAccess || []).map(access => {
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
    path: ref.path,
    resourceType: ref.resource.type,
    resourceId: ref.resource.id,
    public: ref.public,
    privateAccess: privateAccessStrings,
    owner: ref.owner,
    portal: ref.portal
  }

  await es.client.index({
    index: aliasName(ref.portal),
    id: ref._id,
    document: searchDoc
  })
}

export const deletePageRef = async (ref: SearchPage): Promise<void> => {
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
