import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Image } from '#types/image/index.js'
import { Piscina } from 'piscina'
import type { ResizeInput, ResizeOutput } from './resize-image.ts'

import { Router } from 'express'
import mongo from '#mongo'
import * as postReq from '#doc/images/post-req/index.ts'
import { httpError, reqSessionAuthenticated } from '@data-fair/lib-express/index.js'

const router = Router()
export default router

export const resizePiscina = new Piscina<ResizeInput, ResizeOutput>({
  filename: path.resolve(import.meta.dirname, './resize-image.ts'),
  minThreads: 0,
  idleTimeout: 60 * 60 * 1000,
  maxThreads: 1
})

router.post('', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)

  const { body, query, file } = postReq.returnValid(req, { name: 'request' })
  const ownerFilter = { 'owner.type': session.account.type, 'owner.id': session.account.type, 'owner.department': session.account.department }
  if (body.resource.type === 'portal') {
    const hasPortal = !!(await mongo.portals.countDocuments({ ...ownerFilter, _id: body.resource._id }))
    if (!hasPortal) throw httpError(404, 'linked portal not found')
  } else if (body.resource.type === 'page') {
    const hasPage = !!(await mongo.pages.countDocuments({ ...ownerFilter, _id: body.resource._id }))
    if (!hasPage) throw httpError(404, 'linked page not found')
  }

  const created = {
    id: session.user.id,
    name: session.user.name,
    date: new Date().toISOString()
  }
  const image: Image = {
    _id: randomUUID(),
    owner: session.account,
    created,
    updated: created,
    ...body,
    ...(await resizePiscina.run({ filePath: file.path, width: query.width, height: query.height }))
  }
  await mongo.images.insertOne(image)

  res.status(201).json({ ...image, data: undefined })
})

router.get('/:id/data', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)

  const image = await mongo.images.findOne({ _id: req.params.id, 'owner.type': session.account.type, 'owner.id': session.account.type, 'owner.department': session.account.department })
  if (!image) throw httpError(404, 'image not found')

  res.type(image.mimeType).setHeader('Cache-Control', 'private, max-age=604800, immutable').send(image.data)
})
