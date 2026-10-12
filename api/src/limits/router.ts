import type { Request } from 'express'
import type { Limit } from '#types/limit/index.ts'
import { Router } from 'express'
import { httpError, reqSessionAuthenticated, assertAdminMode, secretKeyMatches } from '@data-fair/lib-express'
import * as limitSchema from '#types/limit/index.ts'
import mongo from '#mongo'
import config from '#config'
import { getLimits } from './service.ts'

const router = Router()
export default router

const hasSecretKey = (req: Request) => secretKeyMatches(req.query.key, config.secretKeys.limits)

const assertSuperAdmin = (req: Request) => {
  if (!hasSecretKey(req)) assertAdminMode(reqSessionAuthenticated(req))
}

const accountParams = (req: Request) => {
  const type = req.params.type
  if (type !== 'user' && type !== 'organization') throw httpError(400, 'Wrong consumer type')
  return { type, id: req.params.id as string } as const
}

// Endpoint for customers service to create/update limits
router.post('/:type/:id', async (req, res) => {
  assertSuperAdmin(req)
  const { type, id } = accountParams(req)
  // consumptions are computed, ignore the ones sent by customers
  // and keep only the known keys: customers spreads its subscription account (department, etc)
  const { name, lastUpdate, portals_nb_pages: pages, portals_nb_domains: domains } = req.body ?? {}
  const limit: Limit = limitSchema.returnValid({
    name,
    lastUpdate,
    type,
    id,
    ...(pages && { portals_nb_pages: { limit: pages.limit } }),
    ...(domains && { portals_nb_domains: { limit: domains.limit } })
  }, { name: 'body' })
  await mongo.limits.replaceOne({ type, id }, limit, { upsert: true })
  res.send(limit)
})

// A user can get limits information for their own accounts only
router.get('/:type/:id', async (req, res) => {
  const account = accountParams(req)
  if (!hasSecretKey(req)) {
    const session = reqSessionAuthenticated(req)
    const isMember = account.type === 'user'
      ? session.user.id === account.id
      : session.user.organizations.some(o => o.id === account.id)
    if (!session.user.adminMode && !isMember) throw httpError(403, 'not a member of this account')
  }
  res.send(await getLimits(account))
})

router.get('/', async (req, res) => {
  assertSuperAdmin(req)
  const filter: Record<string, string> = {}
  if (typeof req.query.type === 'string') filter.type = req.query.type
  if (typeof req.query.id === 'string') filter.id = req.query.id
  const results = await mongo.limits.find(filter).sort({ lastUpdate: -1 }).project({ _id: 0 }).limit(10000).toArray()
  res.send({ results, count: results.length })
})
