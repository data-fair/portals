import type { Page } from '#api/types/page'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'
import { mongoPagination } from '@data-fair/lib-express'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const query = getQuery(event) as Record<string, string>

  const mongoQuery: Record<string, unknown> = {
    type: 'news',
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    [portal.staging ? 'requestedPortals' : 'portals']: portal._id
  }

  if (query.q) mongoQuery.$text = { $search: query.q }

  // Filtre par liste de slugs (pour les blocs "liste personnalisée")
  if (query.slugs) {
    mongoQuery['config.newsMetadata.slug'] = { $in: query.slugs.split(',') }
  }

  // Filtres sur la date de publication
  const dateFilter: Record<string, string> = {}
  if (query.after) dateFilter.$gte = query.after
  if (query.before) dateFilter.$lte = query.before
  if (Object.keys(dateFilter).length > 0) {
    mongoQuery['config.newsMetadata.date'] = dateFilter
  }

  // Tri : par défaut date décroissant (les plus récentes en premier)
  const sort: Record<string, 1 | -1> =
    query.sort === 'date:1' ? { 'config.newsMetadata.date': 1 } : { 'config.newsMetadata.date': -1 }

  const { skip, size } = mongoPagination(query)

  const [count, results] = await Promise.all([
    portalMongo.pages.countDocuments(mongoQuery),
    portalMongo.pages.find<Pick<Page, '_id' | 'type' | 'config' | 'updatedAt'>>(mongoQuery, {
      projection: { _id: 1, type: 1, config: 1, updatedAt: 1 },
      sort,
      limit: size,
      skip
    }).toArray()
  ])

  return { results, count }
})
