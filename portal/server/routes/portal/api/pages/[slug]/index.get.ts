import type { RequestPortal } from '~~/server/middleware/get-portal'
import { portalMongo } from '~~/server/plugins/mongo'
import type { Page } from '~~/../api/types/page'

export default defineEventHandler(async (event) => {
  // TODO: check visibility of content based on event.context.portal ?
  const portal: RequestPortal = event.context.portal
  const slug = getRouterParam(event, 'slug')
  const page = await portalMongo.pages.findOne<Pick<Page, 'config'>>(
    {
      slug,
      'owner.type': portal.owner.type,
      'owner.id': portal.owner.id,
      [portal.staging ? 'requestedPortals' : 'portals']: portal._id
    }, { projection: { config: 1 } })
  if (!page) throw createError({ status: 404, message: 'page not found' })
  return page.config
})
