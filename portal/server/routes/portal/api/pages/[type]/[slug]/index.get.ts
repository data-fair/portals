import type { Page } from '#api/types/page'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const type = getRouterParam(event, 'type') as string
  const slug = getRouterParam(event, 'slug') as string

  // the draft host serves the page drafts, of the pages attached to the portal or requested for it
  const configKey = portal.draft ? 'draftConfig' : 'config'
  const mongoQuery: Record<string, unknown> = {
    type,
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    ...(portal.draft
      ? { $or: [{ portals: portal._id }, { requestedPortals: portal._id }] }
      : { [portal.staging ? 'requestedPortals' : 'portals']: portal._id })
  }

  // Standard types do not have a slug
  if (['event', 'news', 'generic'].includes(type)) mongoQuery[`${configKey}.${type}Metadata.slug`] = slug

  const page = await portalMongo.pages.findOne<Pick<Page, '_id' | 'config' | 'draftConfig'>>(
    mongoQuery,
    { projection: { _id: 1, [configKey]: 1 } }
  )

  if (!page) throw createError({ status: 404, message: 'Page not found' })
  return { _id: page._id, ...page[configKey] }
})
