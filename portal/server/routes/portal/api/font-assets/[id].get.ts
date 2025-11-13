import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'
import type { FontAsset } from '~~/../api/types/font-asset'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal

  const fontAssetId = getRouterParam(event, 'id')
  const fontAsset = await portalMongo.fontAssets.findOne<Pick<FontAsset, 'file' | 'data'>>(
    { _id: fontAssetId, 'owner.type': portal.owner.type, 'owner.id': portal.owner.id })
  if (!fontAsset) throw createError({ status: 404, message: 'font asset not found' })

  setResponseHeader(event, 'cache-control', 'public, max-age=604800, immutable')
  setResponseHeader(event, 'content-type', fontAsset.file.type)
  return fontAsset.data.buffer
})
