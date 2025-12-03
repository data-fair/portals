import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'
import type { Use } from '~~/../api/types/use'
import type { Image } from '~~/../api/types/image'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const slug = getRouterParam(event, 'slug') as string

  const mongoQuery: Record<string, unknown> = {
    slug,
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    [portal.staging ? 'requestedPortals' : 'portals']: portal._id
  }

  const use = await portalMongo.uses.findOne<Pick<Use, '_id'>>(
    mongoQuery,
    { projection: { _id: 1 } }
  )

  if (!use) throw createError({ status: 404, message: 'Use not found' })

  const imageId = getRouterParam(event, 'id')
  const image = await portalMongo.images.findOne<Pick<Image, 'mimeType' | 'data'>>(
    { _id: imageId, 'owner.type': portal.owner.type, 'owner.id': portal.owner.id, 'resource.type': 'use', 'resource._id': use._id })
  if (!image) throw createError({ status: 404, message: 'Image not found' })

  setResponseHeader(event, 'cache-control', 'public, max-age=604800, immutable')
  setResponseHeader(event, 'content-type', image.mimeType)
  return image.data.buffer
})
