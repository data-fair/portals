import axios from '@data-fair/lib-node/axios.js'
import axiosWithCookies from '@data-fair/lib-node/axios-with-cookies.js'
import type { AxiosInstance } from 'axios'
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
      searchPageRefs.push({
        _id: `${portal._id}-page-${page._id}`,
        owner: portal.owner,
        portal: portal._id,
        resource: { type: 'page', id: page._id, slug: (page.config as any).slug || page._id },
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
        resource: { type: 'reuse', id: reuse._id, slug: reuse.slug || reuse._id },
        indexingStatus: 'toIndex'
      })
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

  const url = `${portalUrl}/api/search-indexable${ref.resource.type !== 'page' ? `s/${ref.resource.type}` : ''}/${ref.resource.slug}`

  const response = await axiosInstance.get(url, { headers })

  console.log('Indexed page ref:', ref._id, 'with data:', response.data)
}

export const deletePageRef = async (ref: SearchPageRef): Promise<void> => {
  console.log('Deleting page ref:', ref._id)
}
