import type { Page } from '#api/types/page'
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

  const page = await portalMongo.pages.findOne<Pick<Page, 'public' | 'permissions'>>(
    mongoQuery,
    { projection: { public: 1, permissions: 1 } }
  )

  if (!page) throw createError({ status: 404, statusMessage: 'Page not found' })

  if (!page.public) {
    const cookieHeader = getRequestHeader(event, 'cookie')
    const sessionState = await session.readStateFromCookie(cookieHeader).catch(() => null)
    const access = checkPageAccess(sessionState, page)
    if (access === 'unauthenticated') {
      throw createError({ status: 401, statusMessage: 'Authentication required' })
    }
    if (access === 'forbidden') {
      throw createError({ status: 403, statusMessage: 'Access denied' })
    }
  }

  return null
})
