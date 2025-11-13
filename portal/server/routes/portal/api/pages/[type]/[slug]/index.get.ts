import type { Page } from '#api/types/page'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const type = getRouterParam(event, 'type') as string
  const slug = getRouterParam(event, 'slug') as string

  // Requête de base
  const mongoQuery: Record<string, unknown> = {
    type,
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    [portal.staging ? 'requestedPortals' : 'portals']: portal._id
  }

  // Standard types do not have a slug
  if (['event', 'news', 'generic'].includes(type)) mongoQuery[`config.${type}Metadata.slug`] = slug

  const page = await portalMongo.pages.findOne<Pick<Page, 'config'>>(
    mongoQuery,
    { projection: { config: 1 } }
  )

  if (!page) throw createError({ status: 404, message: 'Page not found' })
  return page.config
})
