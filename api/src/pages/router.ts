import type { Page } from '#types/page/index.ts'
import type { Portal } from '#types/portal/index.ts'
import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import mongo from '#mongo'
import findUtils from '../utils/find.ts'
import * as postReqBody from '#doc/pages/post-req-body/index.ts'
import * as patchReqBody from '#doc/pages/patch-req-body/index.ts'
import { httpError, reqSessionAuthenticated, assertAccountRole, assertAdminMode, getAccountRole } from '@data-fair/lib-express/index.js'
import { createPage, validatePageDraft, cancelPageDraft, getPage, assertPageWrite, patchPage, deletePage, generateUniqueSlug, duplicatePageElements, sendPageEvent } from './service.ts'
import { buildDefaultPermissions, buildPageAccessFilter, getUserPermissions } from './operations.ts'
import { reindexPage } from '../search-pages/service.ts'
import { pageFacets } from './aggregations.ts'

const router = Router()
export default router

router.get('', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)

  const params = req.query as Record<string, string>
  const sort = findUtils.sort(params.sort || 'createdAt:-1')
  const { skip, size } = findUtils.pagination(params)
  const project = findUtils.project(params.select)
  const filters = findUtils.query(params, { portal: 'portals', type: 'type', groupId: 'config.genericMetadata.group._id' })

  // If groupId is not specified, exclude documents that have one
  if (params.groupId === 'default') filters['config.genericMetadata.group._id'] = { $exists: false }

  // If isReference=true, we get all references pages, without owner filter
  let query: Record<string, any>
  if (params.isReference === 'true') {
    query = { isReference: true }
  } else {
    query = findUtils.filterPermissions(params, session)
    // Non-admins: further filter by public or explicit read permission
    const accountRole = getAccountRole(session, session.account, { acceptDepAsRoot: true })
    if (accountRole !== 'admin') {
      Object.assign(query, buildPageAccessFilter(session))
    }
  }

  const queryWithFilters = Object.assign(filters, query)

  // Filter by owner (if showAll)
  const showAll = params.showAll === 'true'
  if (showAll && params.owners) {
    const ownersOr = params.owners.split(',').map(owner => {
      const [type, id, department] = owner.split(':')
      if (!type || !id) throw httpError(400, 'Invalid owner format')
      const filter: any = { 'owner.type': type, 'owner.id': id }
      if (department) filter['owner.department'] = department
      return filter
    })
    if (queryWithFilters.$or) {
      queryWithFilters.$and = [{ $or: queryWithFilters.$or }, { $or: ownersOr }]
      delete queryWithFilters.$or
    } else {
      queryWithFilters.$or = ownersOr
    }
  }

  const [count, results, facets] = await Promise.all([
    mongo.pages.countDocuments(queryWithFilters),
    mongo.pages.find(queryWithFilters).project(project).skip(skip).limit(size).sort(sort).toArray(),
    mongo.pages.aggregate(pageFacets(query, showAll)).toArray()
  ])

  const enrichedResults = results.map(page => {
    const userPermissions = getUserPermissions(session, page as Page)
    const accountRole = getAccountRole(session, (page as Page).owner, { acceptDepAsRoot: true })
    if (accountRole !== 'admin') delete (page as any).permissions
    return { ...page, userPermissions }
  })

  res.json({ results: enrichedResults, count, facets: facets[0] })
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
  const config = { ...body.config }
  const pageId = randomUUID()
  const owner = body.owner ?? session.account

  // Handle page duplication if sourcePageId is provided
  if (body.sourcePageId) {
    config.elements = await duplicatePageElements(session, body.sourcePageId, pageId, owner)
  }

  // Allow admins and contributors to create pages
  assertAccountRole(session, owner, ['admin', 'contrib'])

  const page: Page = {
    _id: pageId,
    title: body.title || body.config.title,
    type: body.type,
    owner,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config,
    draftConfig: config,
    portals: body.portals || [],
    requestedPortals: [],
    public: false,
    permissions: buildDefaultPermissions(session, owner)
  }

  const creationDetails = await createPage(page, body.sourcePageId)
  sendPageEvent(page, 'a été créée', 'create', session, creationDetails)

  for (const portalId of page.portals) {
    await reindexPage(page, portalId)
  }

  res.status(201).json(page)
})

router.get('/:id', async (req, res, next) => {
  res.send(await getPage(reqSessionAuthenticated(req), req.params.id))
})

router.patch('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  // Fetch full page (with permissions) for access checks
  const page = await mongo.pages.findOne({ _id: req.params.id })
  if (!page) throw httpError(404, `page "${req.params.id}" not found`)
  assertPageWrite(session, page)

  const body = patchReqBody.returnValid(req.body, { name: 'body' })
  if (body.isReference !== undefined) assertAdminMode(session)

  const ownerRole = getAccountRole(session, page.owner, { acceptDepAsRoot: true })

  // Restrict admin-only fields: owner, permissions, public
  if (body.owner !== undefined || body.permissions !== undefined || body.public !== undefined) {
    if (ownerRole !== 'admin') {
      throw httpError(403, 'only page owner admins can modify owner, permissions and public fields')
    }
  }

  // Handle portals/requestedPortals changes
  if (body.portals !== undefined || body.requestedPortals !== undefined) {
    if (ownerRole !== 'admin') {
      // Only contributors of the page owner can manage portals (non-admins)
      if (ownerRole !== 'contrib') {
        throw httpError(403, 'only admins and contributors of the page owner can manage portal publication')
      }
      // Contributors: direct publish (portals) only allowed for staging portals
      if (body.portals !== undefined) {
        const addedPortalIds = (body.portals as string[]).filter(id => !page.portals.includes(id))
        const removedPortalIds = page.portals.filter(id => !(body.portals as string[]).includes(id))
        const changedPortalIds = [...new Set([...addedPortalIds, ...removedPortalIds])]
        if (changedPortalIds.length > 0) {
          const changedPortals = await mongo.portals.find({ _id: { $in: changedPortalIds } }).project({ staging: 1 }).toArray() as Pick<Portal, '_id' | 'staging'>[]
          const hasNonStaging = changedPortals.some(p => !p.staging)
          if (hasNonStaging) {
            throw httpError(403, 'contributors can only directly publish to staging portals, use requestedPortals for non-staging')
          }
        }
      }
    }
  }

  const updatedPage = await patchPage(page, body, session)

  for (const portalId of updatedPage.portals) {
    await reindexPage(updatedPage, portalId)
  }

  res.send({ ...updatedPage, body })
})

router.delete('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const page = await mongo.pages.findOne({ _id: req.params.id })
  if (!page) throw httpError(404, `page "${req.params.id}" not found`)
  assertPageWrite(session, page)
  await deletePage(page)
  sendPageEvent(page, 'a été supprimée', 'delete', session)
  res.status(204).send()
})

router.post('/:id/draft', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const page = await mongo.pages.findOne({ _id: req.params.id })
  if (!page) throw httpError(404, `page "${req.params.id}" not found`)
  assertPageWrite(session, page)
  await validatePageDraft(page, session)
  res.status(204).send()
})

router.delete('/:id/draft', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const page = await mongo.pages.findOne({ _id: req.params.id })
  if (!page) throw httpError(404, `page "${req.params.id}" not found`)
  assertPageWrite(session, page)
  await cancelPageDraft(page, session)
  res.status(204).send()
})
