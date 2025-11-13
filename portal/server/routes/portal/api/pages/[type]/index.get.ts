import type { Page } from '#api/types/page'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const type = getRouterParam(event, 'type') as string

  // Cette route ne gère que les listes de pages event et news
  if (type !== 'event' && type !== 'news') {
    throw createError({ status: 404, message: `Cannot list pages of type '${type}'.` })
  }

  const query = getQuery(event)

  // Requête de base
  const mongoQuery: Record<string, unknown> = {
    type,
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    [portal.staging ? 'requestedPortals' : 'portals']: portal._id
  }

  // Pagination
  const limit = Math.min(Math.max(parseInt(query.limit as string) || 10, 1), 100)
  const skip = Math.max(parseInt(query.skip as string) || 0, 0)

  // Tri (par défaut, les plus récentes en premier)
  const sort = query.sort === 'asc' ? { 'updated.date': 1 as const } : { 'updated.date': -1 as const }

  // Récupération des pages
  // TODO: do not fetch full config
  const pages = await portalMongo.pages.find<Pick<Page, '_id' | 'type' | 'config' | 'updated'>>(
    mongoQuery,
    {
      projection: { _id: 1, type: 1, config: 1, updated: 1 },
      sort,
      limit,
      skip
    }
  ).toArray()

  // Comptage total pour la pagination
  const total = await portalMongo.pages.countDocuments(mongoQuery)

  return {
    results: pages,
    total,
    limit,
    skip,
    hasMore: skip + limit < total
  }
})
