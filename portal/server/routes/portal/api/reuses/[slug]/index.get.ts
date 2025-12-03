import type { Reuse } from '#api/types/reuse'
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

  const reuse = await portalMongo.reuses.findOne<Pick<Reuse, '_id' | 'slug' | 'config'>>(
    mongoQuery,
    { projection: { _id: 1, slug: 1, config: 1 } }
  )

  if (!reuse) throw createError({ status: 404, message: 'Reuse not found' })
  return reuse
})
