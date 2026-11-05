import type { Readable } from 'node:stream'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal

  const asset = await portalMongo.assets.findOne(
    { _id: getRouterParam(event, 'id'), 'owner.type': portal.owner.type, 'owner.id': portal.owner.id },
    { projection: { key: 1, mimeType: 1 } }
  )
  if (!asset) throw createError({ status: 404, message: 'asset not found' })

  let object
  try {
    object = await readAssetObject(asset.key, getRequestHeader(event, 'range'))
  } catch (err) {
    if ((err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 416) throw createError({ status: 416, message: 'range not satisfiable' })
    throw err
  }

  const isPublic = portal.config.authentication !== 'required' && !portal.draft
  setResponseStatus(event, object.ContentRange ? 206 : 200)
  setResponseHeader(event, 'content-type', asset.mimeType)
  setResponseHeader(event, 'accept-ranges', 'bytes')
  setResponseHeader(event, 'content-length', object.ContentLength as number)
  if (object.ContentRange) setResponseHeader(event, 'content-range', object.ContentRange)
  setResponseHeader(event, 'cache-control', `${isPublic ? 'public' : 'private'}, max-age=31536000, immutable`)
  // no buffering, hence no shared cache either: its key ignores the Range header
  setResponseHeader(event, 'x-accel-buffering', 'no')
  return sendStream(event, object.Body as Readable)
})
