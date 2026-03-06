import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import type { Image } from '#api/types/image'
import { portalMongo } from '~~/server/plugins/mongo'

/**
 * FAVICON FALLBACK HANDLER
 * * * Context:
 * 1. The main website uses a hashed URL with a one-year cache for optimal
 * performance and instant updates via HTML.
 * 2. External services (e.g., Data Fair, RSS readers, SEO bots) explicitly
 * request the standard `/favicon.ico` URL.
 * * * Strategy:
 * Since this URL is fixed, we cannot use long-term caching based on URL hashing.
 * Instead, we re-expose the favicon here using an `ETag` header (based on the
 * image ID) combined with `no-cache`. This allows clients to validate the file
 * via a 304 (Not Modified) response, preventing a full re-download if the
 * favicon has not changed.
 */
export default defineEventHandler(async (event) => {
  const portal: RequestPortal | undefined = event.context.portal
  if (!portal) throw createError({ status: 404, message: 'portal not found' })

  const faviconRef = portal.config?.favicon
  if (!faviconRef) throw createError({ status: 404, message: 'favicon not configured' })

  const favicon = await portalMongo.images.findOne<Pick<Image, '_id' | 'mimeType' | 'data'>>({
    _id: faviconRef._id,
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    'resource.type': 'portal',
    'resource._id': portal._id
  })
  if (!favicon || !favicon.data?.buffer) throw createError({ status: 404, message: 'favicon not found' })

  const etag = favicon._id
  const ifNoneMatch = getRequestHeader(event, 'if-none-match')?.replace(/^W\//, '').replaceAll('"', '')

  setResponseHeader(event, 'ETag', etag)
  setResponseHeader(event, 'Cache-Control', 'no-cache')

  if (ifNoneMatch === etag) {
    return setResponseStatus(event, 304, 'Not Modified')
  }

  setResponseHeader(event, 'Content-Type', favicon.mimeType)
  return favicon.data.buffer
})
