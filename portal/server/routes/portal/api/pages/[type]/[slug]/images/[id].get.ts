import type { Image } from '#api/types/image'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const type = getRouterParam(event, 'type') as string
  const slug = getRouterParam(event, 'slug') as string

  const page = await findPortalPage(portal, type, slug)

  if (!page) throw createError({ status: 404, message: 'Page not found' })

  const imageId = getRouterParam(event, 'id')
  const image = await portalMongo.images.findOne<Pick<Image, 'mimeType' | 'data'>>(
    { _id: imageId, 'owner.type': portal.owner.type, 'owner.id': portal.owner.id, 'resource.type': 'page', 'resource._id': page._id })
  if (!image) throw createError({ status: 404, message: 'Image not found' })

  setResponseHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  setResponseHeader(event, 'content-type', image.mimeType)
  return image.data.buffer
})
