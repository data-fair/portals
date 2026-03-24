import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'
import { mongoSort, mongoProjection, mongoPagination } from '@data-fair/lib-express'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const query = getQuery(event) as Record<string, string>

  // Base request - always filtered on the current portal
  const mongoQuery: Record<string, unknown> = {
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    [portal.staging ? 'requestedPortals' : 'portals']: portal._id
  }

  if (query.q) mongoQuery.$text = { $search: query.q }
  if (query.slugs) mongoQuery.slug = { $in: query.slugs.split(',') }
  if (query.dataset) mongoQuery['config.datasets.id'] = query.dataset

  const { skip, size } = mongoPagination(query)
  const projection: Record<string, 0 | 1 | { $meta: string }> = mongoProjection(query.select) || {}
  let sort
  if (query.q && !query.sort) {
    sort = { score: { $meta: 'textScore' } }
    projection.score = { $meta: 'textScore' }
  } else {
    sort = mongoSort(query.sort || 'updatedAt:-1')
  }

  const [count, results] = await Promise.all([
    portalMongo.reuses.countDocuments(mongoQuery),
    portalMongo.reuses.find(mongoQuery, { projection, skip, limit: size, sort }).toArray()
  ])

  return { results, count }
})
