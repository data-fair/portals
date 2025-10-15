import type { Group } from '#types/group/index.ts'
import { randomUUID } from 'node:crypto'
import slug from 'slugify'
import { Router } from 'express'
import * as postReqBody from '#doc/groups/post-req-body/index.ts'
import * as patchReqBody from '#doc/groups/patch-req-body/index.ts'
import mongo from '#mongo'
import findUtils from '../utils/find.ts'
import { httpError, reqSessionAuthenticated, assertAccountRole } from '@data-fair/lib-express/index.js'
import { createGroup, patchGroup } from './service.ts'

const router = Router()
export default router

router.get('', async (req, res) => {
  const session = reqSessionAuthenticated(req)
  assertAccountRole(session, session.account, 'admin')

  const params = req.query as Record<string, string>
  const sort = findUtils.sort(params.sort || 'created.date:-1')
  const { skip, size } = findUtils.pagination(params, 1000)
  const query = findUtils.filterPermissions(params, session)

  const [results, count] = await Promise.all([
    mongo.groups.find(query).skip(skip).limit(size).skip(skip).sort(sort).toArray(),
    mongo.groups.countDocuments(query)
  ])

  res.json({ results, count })
})

router.post('', async (req, res) => {
  const session = reqSessionAuthenticated(req)
  assertAccountRole(session, session.account, 'admin')

  const body = postReqBody.returnValid(req.body, { name: 'body' })
  const created = {
    id: session.user.id,
    name: session.user.name,
    date: new Date().toISOString()
  }
  const group: Group = {
    _id: randomUUID(),
    slug: slug.default(body.title, { lower: true, strict: true }),
    owner: session.account,
    created,
    updated: created,
    description: '',
    ...body
  }

  await createGroup(group)
  res.status(201).json(group)
})

router.get('/:id', async (req, res) => {
  const session = reqSessionAuthenticated(req)
  const group = await mongo.groups.findOne({ _id: req.params.id })
  if (!group) throw httpError(404, `Group "${req.params.id}" not found`)
  assertAccountRole(session, group.owner, 'admin')
  res.json(group)
})

router.patch('/:id', async (req, res) => {
  const session = reqSessionAuthenticated(req)
  const group = await mongo.groups.findOne({ _id: req.params.id })
  if (!group) throw httpError(404, `Group "${req.params.id}" not found`)
  assertAccountRole(session, group.owner, 'admin')

  const body = patchReqBody.returnValid(req.body, { name: 'body' })
  await patchGroup(group, body, session)
  res.send({ ...group, body })
})

router.delete('/:id', async (req, res) => {
  const session = reqSessionAuthenticated(req)
  const group = await mongo.groups.findOne({ _id: req.params.id })
  if (!group) throw httpError(404, `Group "${req.params.id}" not found`)
  assertAccountRole(session, group.owner, 'admin')
  await mongo.groups.deleteOne({ _id: req.params.id })
  res.status(204).send()
})
