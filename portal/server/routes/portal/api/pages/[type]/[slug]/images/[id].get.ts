import type { Page } from '#api/types/page'
import type { Image } from '#api/types/image'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'
import { session } from '~~/server/plugins/session'
import { checkPageAccess } from '~~/server/utils/page-permissions'

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

  const page = await portalMongo.pages.findOne<Pick<Page, '_id' | 'public' | 'permissions'>>(
    mongoQuery,
    { projection: { _id: 1, public: 1, permissions: 1 } }
  )

  if (!page) throw createError({ status: 404, message: 'Page not found' })

  if (!page.public) {
    const sessionState = await session.readStateFromCookie(getRequestHeader(event, 'cookie'))
    const access = checkPageAccess(sessionState, page, portal.owner)
    if (access === 'unauthenticated') {
      throw createError({ status: 401, message: 'Authentication required' })
    }
    if (access === 'forbidden') {
      throw createError({ status: 403, message: 'Access denied' })
    }
  }

  const imageId = getRouterParam(event, 'id')
  const image = await portalMongo.images.findOne<Pick<Image, 'mimeType' | 'data'>>(
    { _id: imageId, 'owner.type': portal.owner.type, 'owner.id': portal.owner.id, 'resource.type': 'page', 'resource._id': page._id })
  if (!image) throw createError({ status: 404, message: 'Image not found' })

  setResponseHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  setResponseHeader(event, 'content-type', image.mimeType)
  return image.data.buffer
})
