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

  const sort = mongoSort(query.sort || 'updatedAt:-1')
  const { skip, size } = mongoPagination(query)
  const projection = mongoProjection(query.select)

  const [count, results] = await Promise.all([
    portalMongo.reuses.countDocuments(mongoQuery),
    portalMongo.reuses.find(mongoQuery, { projection, skip, limit: size, sort }).toArray()
  ])

  return { results, count }
})
