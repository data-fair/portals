import type { RequestPortal } from '~~/server/middleware/get-portal'
import { portalMongo } from '~~/server/plugins/mongo'
import type { Page } from '~~/../api/types/page'
import type { Image } from '~~/../api/types/image'

export default defineEventHandler(async (event) => {
  // TODO: check visibility of content based on event.context.portal ?
  const portal: RequestPortal = event.context.portal

  const slug = getRouterParam(event, 'slug')
  const page = await portalMongo.pages.findOne<Pick<Page, '_id'>>(
    { 'owner.type': portal.owner.type, 'owner.id': portal.owner.id, slug }, { projection: { _id: 1 } })
  if (!page) throw createError({ status: 404, message: 'page not found' })

  const imageId = getRouterParam(event, 'id')
  const image = await portalMongo.images.findOne<Pick<Image, 'mimeType' | 'data'>>(
    { _id: imageId, 'owner.type': portal.owner.type, 'owner.id': portal.owner.id, 'resource.type': 'page', 'resource._id': page._id })
  if (!image) throw createError({ status: 404, message: 'image not found' })

  setResponseHeader(event, 'cache-control', 'public, max-age=604800, immutable')
  setResponseHeader(event, 'content-type', image.mimeType)
  return image.data.buffer
})
