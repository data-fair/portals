import type { Page } from '#api/types/page'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'
import { mongoPagination, mongoSort } from '@data-fair/lib-express'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const query = getQuery(event) as Record<string, string>

  // Base request - always filtered on the current portal and events pages
  const mongoQuery: Record<string, unknown> = {
    type: 'event',
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    [portal.staging ? 'requestedPortals' : 'portals']: portal._id
  }

  if (query.q) mongoQuery.$text = { $search: query.q }
  if (query.slugs) mongoQuery['config.eventMetadata.slug'] = { $in: query.slugs.split(',') }

  if (query.includePast !== 'true') {
    const now = new Date().toISOString()
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
    mongoQuery.$or = [
      { 'config.eventMetadata.endDate': { $gte: now } },
      {
        'config.eventMetadata.endDate': { $exists: false },
        'config.eventMetadata.startDate': { $gte: startOfToday }
      }
    ]
  }

  // Sort: remap URL field names to MongoDB paths, then delegate to mongoSort for typing
  const fieldMap: Record<string, string> = {
    startDate: 'config.eventMetadata.startDate',
    title: 'config.title'
  }
  const [sortField = 'startDate', sortOrder = '1'] = (query.sort || 'startDate:1').split(':')
  const mongoSortField = fieldMap[sortField] ?? 'config.eventMetadata.startDate'
  const sort = mongoSort(`${mongoSortField}:${sortOrder ?? '1'}`)

  const { skip, size } = mongoPagination(query)
  const projection = { draftConfig: 0, 'config.elements': 0, portals: 0, requestedPortals: 0 }

  const [count, results] = await Promise.all([
    portalMongo.pages.countDocuments(mongoQuery),
    portalMongo.pages.find<Omit<Page, 'draftConfig' | 'config.elements' | 'portals' | 'requestedPortals'>>(mongoQuery, {
      projection, sort, limit: size, skip
    }).toArray()
  ])

  return { results, count }
})
