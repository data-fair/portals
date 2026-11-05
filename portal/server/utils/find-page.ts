import type { Page } from '#api/types/page'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'

/**
 * Finds the page of a portal route by type and slug (standard types have no slug).
 * - public host: the published config of the pages attached to the portal
 *   (of the pages requested for it on a staging portal)
 * - draft host: the draft config (the published one for a legacy page without draft) of the
 *   pages attached to the portal or requested for it
 */
export const findPortalPage = async (portal: RequestPortal, type: string, slug: string) => {
  const hasSlug = ['event', 'news', 'generic'].includes(type)
  const slugKey = `${type}Metadata.slug`
  const mongoQuery: Record<string, unknown> = {
    type,
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id
  }
  if (portal.draft) {
    mongoQuery.$or = [{ portals: portal._id }, { requestedPortals: portal._id }]
    if (hasSlug) {
      mongoQuery.$and = [{
        $or: [
          { [`draftConfig.${slugKey}`]: slug },
          { draftConfig: null, [`config.${slugKey}`]: slug }
        ]
      }]
    }
  } else {
    mongoQuery[portal.staging ? 'requestedPortals' : 'portals'] = portal._id
    if (hasSlug) mongoQuery[`config.${slugKey}`] = slug
  }

  const page = await portalMongo.pages.findOne<Pick<Page, '_id' | 'config' | 'draftConfig'>>(
    mongoQuery,
    { projection: { _id: 1, config: 1, draftConfig: portal.draft ? 1 : undefined } }
  )
  if (!page) return null
  return { _id: page._id, config: portal.draft ? (page.draftConfig ?? page.config) : page.config }
}
