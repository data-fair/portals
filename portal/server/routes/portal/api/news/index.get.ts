import type { PageConfig } from '#api/types/page'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'
import { mongoPagination, mongoSort } from '@data-fair/lib-express'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const query = getQuery(event) as Record<string, string>

  // Base request - always filtered on the current portal and news pages
  const mongoQuery: Record<string, unknown> = {
    type: 'news',
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    portals: portal._id
  }

  if (query.q) mongoQuery.$text = { $search: query.q }
  if (query.slugs) mongoQuery['config.newsMetadata.slug'] = { $in: query.slugs.split(',') }

  // Sort: remap URL field names to MongoDB paths, then delegate to mongoSort for typing
  const fieldMap: Record<string, string> = {
    date: 'config.newsMetadata.date',
    title: 'config.title'
  }
  const [sortField = 'date', sortOrder = '1'] = (query.sort || 'date:1').split(':')
  const mongoSortField = fieldMap[sortField] ?? 'config.newsMetadata.date'
  const sort = mongoSort(`${mongoSortField}:${sortOrder ?? '1'}`)
  const { skip, size } = mongoPagination(query)

  const pipeline = [
    { $match: mongoQuery },
    { $sort: sort },
    { $skip: skip },
    { $limit: size },
    { $project: { _id: 0, 'config.elements': 0 } },
    { $replaceRoot: { newRoot: '$config' } }
  ]

  const [count, results] = await Promise.all([
    portalMongo.pages.countDocuments(mongoQuery),
    portalMongo.pages.aggregate<Omit<PageConfig, 'elements'>>(pipeline).toArray()
  ])

  return { results, count }
})
