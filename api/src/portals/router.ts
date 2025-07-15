import { randomUUID } from 'node:crypto'
import type { Filter, Sort } from 'mongodb'
import type { Portal } from '#types/portal/index.js'

import { Router } from 'express'
import mongo from '#mongo'
import * as postReqBody from '#doc/portals/post-req-body/index.ts'
import * as patchReqBody from '#doc/portals/patch-req-body/index.ts'
import { mongoPagination, mongoProjection, httpError, reqSessionAuthenticated, assertAccountRole } from '@data-fair/lib-express/index.js'
import { createPortal, validatePortalDraft, cancelPortalDraft, getPortalAsAdmin, patchPortal } from './service.ts'

const router = Router()
export default router

router.get('', async (req, res, next) => {
  const sessionState = reqSessionAuthenticated(req)
  const { account, accountRole } = sessionState
  if (accountRole !== 'admin') throw httpError(403, 'admin only')

  // TODO: account filter for super admins ?
  const query: Filter<Portal> = { 'sender.type': account.type, 'sender.id': account.id }
  // if (req.query.q && typeof req.query.q === 'string') query.$text = { $search: req.query.q, $language: lang || config.i18n.defaultLocale }

  const project = mongoProjection(req.query.select)

  // implement a special pagination based on the fact that we always sort by date
  const sort: Sort = { _id: -1 }
  const { skip, size } = mongoPagination(req.query, 20)
  if (req.query.before && typeof req.query.before === 'string') {
    const [beforeDate, beforeId] = req.query.before.split('/')
    query.date = { $lte: beforeDate }
    // optional beforeId as a tie-breaker
    if (beforeId) query._id = { $lt: beforeId }
  }

  const [count, portals] = await Promise.all([
    mongo.portals.countDocuments(query),
    mongo.portals.find(query).project(project).skip(skip).limit(size).sort(sort).toArray()
  ])

  const response: any = { count, results: portals }

  res.json(response)
})

router.post('', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)

  const body = postReqBody.returnValid(req.body, { name: 'body' })
  const created = {
    id: session.user.id,
    name: session.user.name,
    date: new Date().toISOString()
  }
  const portal: Portal = {
    _id: randomUUID(),
    owner: session.account,
    created,
    updated: created,
    ...body,
    draftConfig: body.config
  }
  assertAccountRole(session, portal.owner, 'admin')

  await createPortal(portal)

  res.status(201).json(portal)
})

router.get('/:id', async (req, res, next) => {
  res.send(await getPortalAsAdmin(reqSessionAuthenticated(req), req.params.id))
})

router.patch('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const portal = await getPortalAsAdmin(session, req.params.id)
  const body = patchReqBody.returnValid(req.body, { name: 'body' })
  await patchPortal(portal, body, session)
  res.send({ ...portal, body })
})

router.post('/:id/draft', async (req, res, next) => {
  const portal = await getPortalAsAdmin(reqSessionAuthenticated(req), req.params.id)
  await validatePortalDraft(portal)
  res.status(201).send()
})

router.delete('/:id/draft', async (req, res, next) => {
  const portal = await getPortalAsAdmin(reqSessionAuthenticated(req), req.params.id)
  await cancelPortalDraft(portal)
  res.status(201).send()
})
