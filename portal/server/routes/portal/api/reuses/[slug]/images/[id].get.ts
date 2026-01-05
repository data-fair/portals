import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'
import type { Reuse } from '~~/../api/types/reuse'
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

  const reuse = await portalMongo.reuses.findOne<Pick<Reuse, '_id'>>(
    mongoQuery,
    { projection: { _id: 1 } }
  )

  if (!reuse) throw createError({ status: 404, message: 'Reuse not found' })

  const imageId = getRouterParam(event, 'id')
  const image = await portalMongo.images.findOne<Pick<Image, 'mimeType' | 'data'>>(
    { _id: imageId, 'owner.type': portal.owner.type, 'owner.id': portal.owner.id, 'resource.type': 'reuse', 'resource._id': reuse._id })
  if (!image) throw createError({ status: 404, message: 'Image not found' })

  setResponseHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  setResponseHeader(event, 'content-type', image.mimeType)
  return image.data.buffer
})
