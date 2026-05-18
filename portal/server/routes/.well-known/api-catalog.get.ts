import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { createError, defineEventHandler, setResponseHeader } from 'h3'

interface LinksetEntry {
  anchor: string
  'service-desc'?: Array<{ href: string, type: string }>
  'service-doc'?: Array<{ href: string, type: string }>
  status?: Array<{ href: string }>
  collection?: Array<{ href: string, type: string }>
}

const OPENAPI_MEDIA_TYPE = 'application/vnd.oai.openapi+json;version=3.0'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal

  if (portal.draft || !portal.config.allowRobots) {
    throw createError({ status: 404 })
  }

  const baseUrl = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
  const dataFairBase = `${baseUrl}/data-fair/api/v1`
  const pingHref = `${dataFairBase}/ping`

  const linkset: LinksetEntry[] = [
    {
      anchor: dataFairBase,
      'service-desc': [{ href: `${dataFairBase}/api-docs.json`, type: OPENAPI_MEDIA_TYPE }],
      'service-doc': [{ href: `${baseUrl}/catalog-api-doc`, type: 'text/html' }],
      status: [{ href: pingHref }],
      collection: [{ href: `${dataFairBase}/datasets`, type: 'application/json' }]
    }
  ]

  const datasetsResponse = await $fetch<{ count: number, results: Array<{ slug: string }> }>(
    `${dataFairBase}/datasets`,
    {
      query: {
        select: 'slug',
        size: 1000,
        publicationSites: `data-fair-portals:${portal._id}`
      }
    }
  ).catch(() => null)

  if (datasetsResponse?.results) {
    for (const dataset of datasetsResponse.results) {
      if (!dataset.slug) continue
      const datasetApi = `${dataFairBase}/datasets/${dataset.slug}`
      linkset.push({
        anchor: datasetApi,
        'service-desc': [{ href: `${datasetApi}/api-docs.json`, type: OPENAPI_MEDIA_TYPE }],
        'service-doc': [{ href: `${baseUrl}/datasets/${dataset.slug}/api-doc`, type: 'text/html' }],
        status: [{ href: pingHref }]
      })
    }
  }

  setResponseHeader(event, 'content-type', 'application/linkset+json')

  return { linkset }
})
