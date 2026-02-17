import axios from '@data-fair/lib-node/axios.js'
import axiosWithCookies from '@data-fair/lib-node/axios-with-cookies.js'
import type { AxiosInstance } from 'axios'
import * as parse5 from 'parse5'
import config from '#config'
import mongo from '#mongo'
import es from '#es'
import type { Portal } from '#types/portal/index.js'
import type { Page } from '#types/page/index.js'
import type { Reuse } from '#types/reuse/index.js'
import type { SearchPageRef } from '#types/search-page-ref/index.js'
import { indexDefinition } from './es.js'

const indexName = (portalId: string) => `portal-search-${portalId}`
const aliasName = (portalId: string) => `portal-search-${portalId}`

const getPortalUrl = async (portalId: string): Promise<string> => {
  const portal = await mongo.portals.findOne({ _id: portalId }) as Portal | null
  if (!portal) {
    throw new Error(`Portal not found: ${portalId}`)
  }
  return portal.ingress?.url || config.portalUrlPattern.replace('{subdomain}', portalId)
}

const createPseudoSession = async (owner: SearchPageRef['owner']): Promise<AxiosInstance> => {
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
      if (pageConfig.slug) {
        if (pageConfig.group?.slug) {
          return `/groups/${pageConfig.group.slug}/pages/${pageConfig.slug}`
        }
        return `/pages/${pageConfig.slug}`
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
  const index = indexName(portal._id)
  const alias = aliasName(portal._id)

  await es.client.indices.create(indexDefinition(portal))

  try {
    await es.client.indices.putAlias({ index, name: alias })
  } catch (err: any) {
    if (err.meta?.body?.error?.type !== 'resource_already_exists_exception') {
      throw err
    }
  }

  const searchPageRefs: SearchPageRef[] = []

  if (searchTypes.includes('page')) {
    const pages = await mongo.pages.find({
      'owner.type': portal.owner.type,
      'owner.id': portal.owner.id,
      portal: portal._id
    }).toArray() as Page[]

    for (const page of pages) {
      const path = getPagePath(page)
      if (!path) continue

      searchPageRefs.push({
        _id: `${portal._id}-page-${page._id}`,
        owner: portal.owner,
        portal: portal._id,
        resource: { type: 'page', id: page._id },
        path,
        indexingStatus: 'toIndex'
      })
    }
  }

  if (searchTypes.includes('reuse')) {
    const reuses = await mongo.reuses.find({
      'owner.type': portal.owner.type,
      'owner.id': portal.owner.id,
      portal: portal._id
    }).toArray() as Reuse[]

    for (const reuse of reuses) {
      searchPageRefs.push({
        _id: `${portal._id}-reuse-${reuse._id}`,
        owner: portal.owner,
        portal: portal._id,
        resource: { type: 'reuse', id: reuse._id },
        path: `/reuses/${reuse.slug || reuse._id}`,
        indexingStatus: 'toIndex'
      })
    }
  }

  if (searchTypes.includes('dataset') || searchTypes.includes('application')) {
    const portalUrl = await getPortalUrl(portal._id)
    const axiosInstance = await createPseudoSession(portal.owner)

    if (searchTypes.includes('dataset')) {
      try {
        const datasetsResponse = await axiosInstance.get(`${portalUrl}/data-fair/api/v1/datasets`, {
          params: {
            size: 1000,
            select: 'slug',
            publicationSites: `data-fair-portals:${portal._id}`
          }
        })

        for (const dataset of datasetsResponse.data.results || []) {
          if (!dataset.slug) continue
          searchPageRefs.push({
            _id: `${portal._id}-dataset-${dataset.slug}`,
            owner: portal.owner,
            portal: portal._id,
            resource: { type: 'dataset', id: dataset.slug },
            path: `/datasets/${dataset.slug}`,
            indexingStatus: 'toIndex'
          })
        }
      } catch (err) {
        console.error('Error fetching datasets for search indexing:', err)
      }
    }

    if (searchTypes.includes('application')) {
      try {
        const applicationsResponse = await axiosInstance.get(`${portalUrl}/data-fair/api/v1/applications`, {
          params: {
            size: 1000,
            select: 'slug',
            publicationSites: `data-fair-portals:${portal._id}`
          }
        })

        for (const application of applicationsResponse.data.results || []) {
          if (!application.slug) continue
          searchPageRefs.push({
            _id: `${portal._id}-application-${application.slug}`,
            owner: portal.owner,
            portal: portal._id,
            resource: { type: 'application', id: application.slug },
            path: `/applications/${application.slug}`,
            indexingStatus: 'toIndex'
          })
        }
      } catch (err) {
        console.error('Error fetching applications for search indexing:', err)
      }
    }
  }

  if (searchPageRefs.length > 0) {
    await mongo.searchPageRefs.insertMany(searchPageRefs)
  }
}

export const indexPageRef = async (ref: SearchPageRef): Promise<void> => {
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

  const document = parse5.parse(html) as any

  let title = ''
  let description = ''
  let text = ''

  const findMetaContent = (name: string): string | undefined => {
    const findMeta = (nodes: any[]): any | undefined => {
      for (const node of nodes) {
        if (node.nodeName === 'meta') {
          const attrs = node.attrs || []
          if (attrs.some((a: any) => a.name === 'name' && a.value === name)) {
            return node
          }
        }
        if (node.childNodes) {
          const found = findMeta(node.childNodes)
          if (found) return found
        }
      }
      return undefined
    }

    const meta = findMeta(document.childNodes)
    if (meta) {
      const attrs = meta.attrs || []
      const contentAttr = attrs.find((a: any) => a.name === 'content')
      return contentAttr?.value
    }
    return undefined
  }

  const extractText = (nodes: any[]): string => {
    let result = ''
    for (const node of nodes) {
      if (node.nodeName === '#text' && node.value) {
        result += node.value + ' '
      }
      if (node.childNodes) {
        result += extractText(node.childNodes)
      }
    }
    return result.trim()
  }

  const findTitle = (): string => {
    const findInNodes = (nodes: any[]): string | undefined => {
      for (const node of nodes) {
        if (node.nodeName === 'title') {
          if (node.childNodes && node.childNodes.length > 0 && node.childNodes[0].value) {
            return node.childNodes[0].value
          }
        }
        if (node.childNodes) {
          const found = findInNodes(node.childNodes)
          if (found) return found
        }
      }
      return undefined
    }
    return findInNodes(document.childNodes) || ''
  }

  const findBodyText = (): string => {
    const findBody = (nodes: any[]): any | undefined => {
      for (const node of nodes) {
        if (node.nodeName === 'body') {
          return node
        }
        if (node.childNodes) {
          const found = findBody(node.childNodes)
          if (found) return found
        }
      }
      return undefined
    }

    const body = findBody(document.childNodes)
    if (body && body.childNodes) {
      return extractText(body.childNodes)
    }
    return ''
  }

  title = findTitle()
  description = findMetaContent('description') || ''
  text = findBodyText()

  const privateAccessStrings = (ref.privateAccess || []).map(access => {
    const id = access.id || '*'
    const department = access.department || '*'
    const roles = access.roles?.join(',') || '*'
    return `${access.type}:${id}:${department}:${roles}`
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

export const deletePageRef = async (ref: SearchPageRef): Promise<void> => {
  console.log('Deleting page ref:', ref._id)
}
