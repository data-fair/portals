import { randomUUID } from 'node:crypto'
import type { Filter, Sort } from 'mongodb'
import type { Page } from '#types/page/index.js'

import { Router } from 'express'
import mongo from '#mongo'
import * as postReqBody from '#doc/pages/post-req-body/index.ts'
import * as patchReqBody from '#doc/pages/patch-req-body/index.ts'
import { mongoPagination, mongoProjection, httpError, reqSessionAuthenticated, assertAccountRole } from '@data-fair/lib-express/index.js'
import { createPage, validatePageDraft, cancelPageDraft, getPageAsAdmin, patchPage } from './service.ts'

const router = Router()
export default router

router.get('', async (req, res, next) => {
  const sessionState = reqSessionAuthenticated(req)
  const { account, accountRole } = sessionState
  if (accountRole !== 'admin') throw httpError(403, 'admin only')

  // TODO: account filter for super admins ?
  const showAll = req.query.showAll === 'true' || req.query.showAll === '1'
  if (showAll && !sessionState.user.adminMode) throw httpError(403, 'only super admins can use showAll parameter')
  const query: Filter<Page> = showAll ? {} : { 'owner.type': account.type, 'owner.id': account.id }
  // if (req.query.q && typeof req.query.q === 'string') query.$text = { $search: req.query.q, $language: lang || config.i18n.defaultLocale }

  const project = mongoProjection(req.query.select)

  // implement a special pagination based on the fact that we always sort by date
  const sort: Sort = { _id: -1 }
  const { skip, size } = mongoPagination(req.query, 20)

  const [count, pages] = await Promise.all([
    mongo.pages.countDocuments(query),
    mongo.pages.find(query).project(project).skip(skip).limit(size).sort(sort).toArray()
  ])

  const response: any = { count, results: pages }

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
  const page: Page = {
    _id: randomUUID(),
    owner: session.account,
    created,
    updated: created,
    ...body,
    draftConfig: body.config
  }
  assertAccountRole(session, page.owner, 'admin')

  await createPage(page)

  res.status(201).json(page)
})

router.get('/:id', async (req, res, next) => {
  res.send(await getPageAsAdmin(reqSessionAuthenticated(req), req.params.id))
})

router.patch('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const page = await getPageAsAdmin(session, req.params.id)
  const body = patchReqBody.returnValid(req.body, { name: 'body' })
  await patchPage(page, body, session)
  res.send({ ...page, body })
})

router.post('/:id/draft', async (req, res, next) => {
  const page = await getPageAsAdmin(reqSessionAuthenticated(req), req.params.id)
  await validatePageDraft(page)
  res.status(201).send()
})

router.delete('/:id/draft', async (req, res, next) => {
  const page = await getPageAsAdmin(reqSessionAuthenticated(req), req.params.id)
  await cancelPageDraft(page)
  res.status(201).send()
})
