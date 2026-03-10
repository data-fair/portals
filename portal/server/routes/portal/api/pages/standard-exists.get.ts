import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'

const STANDARD_PAGE_TYPES = [
  'contact',
  'accessibility',
  'terms-of-service',
  'legal-notice',
  'privacy-policy',
  'cookie-policy',
  'applications',
  'datasets',
  'reuses',
  'event-catalog',
  'news-catalog'
] as const

type StandardPageType = typeof STANDARD_PAGE_TYPES[number]

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal

  const mongoQuery = {
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    [portal.staging ? 'requestedPortals' : 'portals']: portal._id,
    type: { $in: [...STANDARD_PAGE_TYPES] }
  }

  const pages = await portalMongo.pages.find(
    mongoQuery,
    { projection: { type: 1, _id: 0 } }
  ).toArray()

  // Return an object with each standard page type as key and boolean as value
  const result: Record<StandardPageType, boolean> = {
    contact: false,
    accessibility: false,
    'terms-of-service': false,
    'legal-notice': false,
    'privacy-policy': false,
    'cookie-policy': false,
    applications: false,
    datasets: false,
    reuses: false,
    'event-catalog': false,
    'news-catalog': false
  }

  pages.forEach(page => {
    if (STANDARD_PAGE_TYPES.includes(page.type as StandardPageType)) {
      result[page.type as StandardPageType] = true
    }
  })

  return result
})
