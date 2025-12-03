import type { Use } from '#api/types/use'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal

  const query = getQuery(event)

  // Requête de base
  const mongoQuery: Record<string, unknown> = {
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    [portal.staging ? 'requestedPortals' : 'portals']: portal._id
  }

  // Filter by dataset if provided
  if (query.dataset) {
    mongoQuery['config.datasets.id'] = query.dataset
  }

  // Pagination
  const limit = Math.min(Math.max(parseInt(query.limit as string) || 10, 1), 100)
  const skip = Math.max(parseInt(query.skip as string) || 0, 0)

  // Tri (par défaut, les plus récentes en premier)
  const sort = query.sort === 'asc' ? { 'updated.date': 1 as const } : { 'updated.date': -1 as const }

  // Récupération des uses
  const uses = await portalMongo.uses.find<Pick<Use, '_id' | 'slug' | 'config' | 'updated'>>(
    mongoQuery,
    {
      projection: { _id: 1, slug: 1, config: 1, updated: 1 },
      sort,
      limit,
      skip
    }
  ).toArray()

  // Comptage total pour la pagination
  const total = await portalMongo.uses.countDocuments(mongoQuery)

  return {
    results: uses,
    total,
    limit,
    skip,
    hasMore: skip + limit < total
  }
})
