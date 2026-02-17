import axios from '@data-fair/lib-node/axios.js'
import axiosWithCookies from '@data-fair/lib-node/axios-with-cookies.js'
import type { AxiosInstance } from 'axios'
import config from '#config'
import type { SearchPageRef } from '#types/search-page-ref/index.js'

const getPortalUrl = (portalId: string): string => {
  return config.portalUrlPattern.replace('{subdomain}', portalId)
}

const createPseudoSession = async (owner: SearchPageRef['owner']): Promise<AxiosInstance> => {
  const ax = axiosWithCookies()
  await ax.post(
    `${config.privateDirectoryUrl}/api/auth/pseudo?key=${config.secretKeys.pseudoSession}`,
    { type: owner.type, id: owner.id }
  )
  return ax
}

export const indexPageRef = async (ref: SearchPageRef): Promise<void> => {
  if (!ref.portal) {
    throw new Error('portal is required for indexing')
  }

  const portalUrl = getPortalUrl(ref.portal)
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
