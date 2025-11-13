import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'
import type { Page } from '~~/../api/types/page'
import type { Image } from '~~/../api/types/image'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const type = getRouterParam(event, 'type') as string
  const slug = getRouterParam(event, 'slug') as string

  const mongoQuery: Record<string, unknown> = {
    type,
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    [portal.staging ? 'requestedPortals' : 'portals']: portal._id
  }

  // Standard types do not have a slug
  if (['event', 'news', 'generic'].includes(type)) mongoQuery[`config.${type}Metadata.slug`] = slug

  const page = await portalMongo.pages.findOne<Pick<Page, '_id'>>(
    mongoQuery,
    { projection: { _id: 1 } }
  )

  if (!page) throw createError({ status: 404, message: 'Page not found' })

  const imageId = getRouterParam(event, 'id')
  const image = await portalMongo.images.findOne<Pick<Image, 'mimeType' | 'data'>>(
    { _id: imageId, 'owner.type': portal.owner.type, 'owner.id': portal.owner.id, 'resource.type': 'page', 'resource._id': page._id })
  if (!image) throw createError({ status: 404, message: 'Image not found' })

  setResponseHeader(event, 'cache-control', 'public, max-age=604800, immutable')
  setResponseHeader(event, 'content-type', image.mimeType)
  return image.data.buffer
})
