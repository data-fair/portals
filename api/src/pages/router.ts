import type { Page } from '#types/page/index.ts'
import { randomUUID } from 'node:crypto'
import slug from 'slugify'
import { Router } from 'express'
import mongo from '#mongo'
import findUtils from '../utils/find.ts'
import * as postReqBody from '#doc/pages/post-req-body/index.ts'
import * as patchReqBody from '#doc/pages/patch-req-body/index.ts'
import { httpError, reqSessionAuthenticated, assertAccountRole } from '@data-fair/lib-express/index.js'
import { createPage, validatePageDraft, cancelPageDraft, getPageAsContrib, patchPage, deletePage } from './service.ts'

const router = Router()
export default router

router.get('', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  assertAccountRole(session, session.account, 'admin')

  const params = req.query as Record<string, string>
  const sort = findUtils.sort(params.sort || 'updated.date:-1')
  const { skip, size } = findUtils.pagination(params)
  const project = findUtils.project(params.select)
  const filters = findUtils.query(params, { portal: 'portals', type: 'type', groupId: 'config.genericMetadata.group._id' })

  // If groupId is not specified, exclude documents that have one
  if (params.groupId === 'default') filters['config.genericMetadata.group._id'] = { $exists: false }

  // If isReference=true, we get all references pages, without owner filter
  const query = params.isReference === 'true' ? { isReference: true } : findUtils.filterPermissions(params, session)
  const queryWithFilters = Object.assign(filters, query)

  // TODO: account filter for super admins ?

  const [count, results] = await Promise.all([
    mongo.pages.countDocuments(queryWithFilters),
    mongo.pages.find(queryWithFilters).project(project).skip(skip).limit(size).sort(sort).toArray()
  ])

  res.json({ results, count })
})

router.post('', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)

  const body = postReqBody.returnValid(req.body, { name: 'body' })
  const created = {
    id: session.user.id,
    name: session.user.name,
    date: new Date().toISOString()
  }
  const config = { ...body.config }
  if (['event', 'news', 'generic'].includes(body.type)) {
    config[body.type + 'Metadata'] = {
      slug: slug.default(body.config.title, { lower: true, strict: true })
    }
  }
  const page: Page = {
    _id: randomUUID(),
    type: body.type,
    owner: body.owner ?? session.account,
    created,
    updated: created,
    config,
    draftConfig: config,
    portals: body.portals || [],
    requestedPortals: []
  }
  assertAccountRole(session, page.owner, 'admin')

  await createPage(page)

  res.status(201).json(page)
})

router.get('/:id', async (req, res, next) => {
  res.send(await getPageAsContrib(reqSessionAuthenticated(req), req.params.id))
})

router.patch('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const page = await getPageAsContrib(session, req.params.id)
  const body = patchReqBody.returnValid(req.body, { name: 'body' })
  if (body.portals) assertAccountRole(session, page.owner, 'admin')
  await patchPage(page, body, session)
  res.send({ ...page, body })
})

router.delete('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const page = await mongo.pages.findOne({ _id: req.params.id })
  if (!page) throw httpError(404, `page "${req.params.id}" not found`)
  assertAccountRole(session, page.owner, 'admin')
  await deletePage(page)
  res.status(201).send()
})

router.post('/:id/draft', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const page = await getPageAsContrib(session, req.params.id)
  await validatePageDraft(page, session)
  res.status(201).send()
})

router.delete('/:id/draft', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const page = await getPageAsContrib(session, req.params.id)
  await cancelPageDraft(page, session)
  res.status(201).send()
})
