import type { Use } from '#api/types/use'
import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { portalMongo } from '~~/server/plugins/mongo'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const slug = getRouterParam(event, 'slug') as string

  // Requête de base
  const mongoQuery: Record<string, unknown> = {
    slug,
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    [portal.staging ? 'requestedPortals' : 'portals']: portal._id
  }

  const use = await portalMongo.uses.findOne<Pick<Use, '_id' | 'slug' | 'config'>>(
    mongoQuery,
    { projection: { _id: 1, slug: 1, config: 1 } }
  )

  if (!use) throw createError({ status: 404, message: 'Use not found' })
  return use
})
