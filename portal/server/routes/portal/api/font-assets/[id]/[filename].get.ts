import type { FontAsset as FontAssetType } from '#api/types/font-asset'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal

  const fontAssetId = getRouterParam(event, 'id')
  const fontAsset = await portalMongo.fontAssets.findOne<Pick<FontAssetType, 'file' | 'data'>>(
    { _id: fontAssetId, 'owner.type': portal.owner.type, 'owner.id': portal.owner.id })
  // not thrown: the HTML error page is rendered by a /__nuxt_error sub-request that the auth
  // middleware redirects to the login page on private portals
  if (!fontAsset) {
    setResponseStatus(event, 404)
    return 'font asset not found'
  }

  setResponseHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  setResponseHeader(event, 'content-type', fontAsset.file.type)
  return fontAsset.data.buffer
})
