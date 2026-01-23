import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import type { Image } from '~~/../api/types/image'
import { portalMongo } from '~~/server/plugins/mongo'

export default defineEventHandler(async (event) => {
  // TODO: check visibility of content based on event.context.portal ?
  const portal: RequestPortal = event.context.portal

  const imageId = getRouterParam(event, 'id')
  const image = await portalMongo.images.findOne<Pick<Image, 'mimeType' | 'data'>>(
    { _id: imageId, 'owner.type': portal.owner.type, 'owner.id': portal.owner.id, 'resource.type': 'portal', 'resource._id': portal._id })
  if (!image) throw createError({ status: 404, message: 'image not found' })

  setResponseHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  setResponseHeader(event, 'content-type', image.mimeType)
  return image.data.buffer
})
