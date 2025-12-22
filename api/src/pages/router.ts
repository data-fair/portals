import type { Page } from '#types/page/index.ts'
import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import mongo from '#mongo'
import findUtils from '../utils/find.ts'
import * as postReqBody from '#doc/pages/post-req-body/index.ts'
import * as patchReqBody from '#doc/pages/patch-req-body/index.ts'
import { httpError, reqSessionAuthenticated, assertAccountRole, assertAdminMode } from '@data-fair/lib-express/index.js'
import { createPage, validatePageDraft, cancelPageDraft, getPageAsContrib, patchPage, deletePage, generateUniqueSlug, duplicatePageElements, sendPageEvent } from './service.ts'

const router = Router()
export default router

router.get('', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  assertAccountRole(session, session.account, 'admin')

  const params = req.query as Record<string, string>
  const sort = findUtils.sort(params.sort || 'createdAt:-1')
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

  // Auto-generate slug if not provided, before validation
  if (['event', 'news', 'generic'].includes(req.body.type)) {
    const metadataKey = req.body.type + 'Metadata'
    const metadata = req.body.config?.[metadataKey] || {}

    if (!metadata.slug) { // Generate unique slug from title if not provided
      const owner = req.body.owner ?? session.account
      metadata.slug = await generateUniqueSlug(
        req.body.config?.title || '',
        req.body.type as 'event' | 'news' | 'generic',
        owner
      )
      req.body.config = { ...req.body.config, [metadataKey]: metadata }
    }
  }

  const body = postReqBody.returnValid(req.body, { name: 'body' })
  const createdAt = new Date().toISOString()
  const config = { ...body.config }
  const pageId = randomUUID()
  const owner = body.owner ?? session.account

  // Handle page duplication if sourcePageId is provided
  if (body.sourcePageId) {
    config.elements = await duplicatePageElements(session, body.sourcePageId, pageId, owner)
  }

  const page: Page = {
    _id: pageId,
    title: body.config.title,
    type: body.type,
    owner,
    createdAt,
    updatedAt: createdAt,
    config,
    draftConfig: config,
    portals: body.portals || [],
    requestedPortals: []
  }
  assertAccountRole(session, page.owner, 'admin')

  const creationDetails = await createPage(page, body.sourcePageId)
  sendPageEvent(page, 'a été créée', 'create', session, creationDetails)
  res.status(201).json(page)
})

router.get('/:id', async (req, res, next) => {
  res.send(await getPageAsContrib(reqSessionAuthenticated(req), req.params.id))
})

router.patch('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const page = await getPageAsContrib(session, req.params.id)
  const body = patchReqBody.returnValid(req.body, { name: 'body' })
  if (body.isReference !== undefined) assertAdminMode(session)
  if (body.portals) assertAccountRole(session, page.owner, 'admin')
  const updatedPage = await patchPage(page, body, session)
  res.send({ ...updatedPage, body })
})

router.delete('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const page = await mongo.pages.findOne({ _id: req.params.id })
  if (!page) throw httpError(404, `page "${req.params.id}" not found`)
  assertAccountRole(session, page.owner, 'admin')
  await deletePage(page)
  sendPageEvent(page, 'a été supprimée', 'delete', session)
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
