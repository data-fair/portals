import type { Reuse } from '#types/reuse/index.ts'
import { randomUUID } from 'node:crypto'
import slug from 'slugify'
import { Router } from 'express'
import mongo from '#mongo'
import findUtils from '../utils/find.ts'
import { httpError, reqSessionAuthenticated, assertAccountRole } from '@data-fair/lib-express/index.js'
import { createReuse, getReuseAsAdmin, patchReuse, deleteReuse } from './service.ts'

const router = Router()
export default router

router.get('', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  assertAccountRole(session, session.account, 'admin')

  const params = req.query as Record<string, string>
  const sort = findUtils.sort(params.sort || 'created.date:-1')
  const { skip, size } = findUtils.pagination(params)
  const project = findUtils.project(params.select)
  const filters = findUtils.query(params, { portal: 'portals' })

  // If showAll is true, we get all reuses without owner filter (super admin mode)
  const showAll = params.showAll === 'true' || params.showAll === '1'
  if (showAll && !session.user.adminMode) throw httpError(403, 'only super admins can use showAll parameter')
  const query = showAll ? {} : findUtils.filterPermissions(params, session)
  const queryWithFilters = Object.assign(filters, query)

  const [count, results] = await Promise.all([
    mongo.reuses.countDocuments(queryWithFilters),
    mongo.reuses.find(queryWithFilters).project(project).skip(skip).limit(size).sort(sort).toArray()
  ])

  res.json({ results, count })
})

router.post('', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  assertAccountRole(session, session.account, 'admin')

  const body = req.body as { owner?: Reuse['owner'], config: Reuse['config'], portals?: string[] }

  const created = {
    id: session.user.id,
    name: session.user.name,
    date: new Date().toISOString()
  }
  const config = { ...body.config }
  const reuseId = randomUUID()
  const owner = body.owner ?? session.account

  // Generate slug from title
  const baseSlug = slug.default(config.title, { lower: true, strict: true })
  let uniqueSlug = baseSlug
  let counter = 1

  // Check if slug already exists for this owner
  while (true) {
    const existing = await mongo.reuses.findOne({
      'owner.type': owner.type,
      'owner.id': owner.id,
      slug: uniqueSlug
    })
    if (!existing) break
    uniqueSlug = `${baseSlug}-${counter}`
    counter++
  }

  const reuse: Reuse = {
    _id: reuseId,
    title: config.title,
    slug: uniqueSlug,
    owner,
    created,
    updated: created,
    config,
    portals: body.portals || [],
    requestedPortals: []
  }
  assertAccountRole(session, reuse.owner, 'admin')

  await createReuse(reuse)

  res.status(201).json(reuse)
})

router.get('/:id', async (req, res, next) => {
  res.send(await getReuseAsAdmin(reqSessionAuthenticated(req), req.params.id))
})

router.patch('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const reuse = await getReuseAsAdmin(session, req.params.id)
  const body = req.body as Partial<Reuse>
  if (body.portals) assertAccountRole(session, reuse.owner, 'admin')
  const updatedReuse = await patchReuse(reuse, body, session)
  res.send(updatedReuse)
})

router.delete('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const reuse = await mongo.reuses.findOne({ _id: req.params.id })
  if (!reuse) throw httpError(404, `reuse "${req.params.id}" not found`)
  assertAccountRole(session, reuse.owner, 'admin')
  await deleteReuse(reuse)
  res.status(201).send()
})
