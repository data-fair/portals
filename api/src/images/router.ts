import config from '#config'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Image } from '#types/image/index.js'
import { Piscina } from 'piscina'
import multer from 'multer'
import type { ResizeInput, ResizeOutput } from './resize-image.ts'

import { type Request, type Response, type NextFunction, Router } from 'express'
import mongo from '#mongo'
import * as postReq from '#doc/images/post-req/index.ts'
import { httpError, reqSessionAuthenticated } from '@data-fair/lib-express/index.js'

const router = Router()
export default router

const upload = multer({ dest: config.tmpDir })

export const resizePiscina = new Piscina<ResizeInput, ResizeOutput>({
  filename: path.resolve(import.meta.dirname, './resize-image.ts'),
  minThreads: 0,
  idleTimeout: 60 * 60 * 1000,
  maxThreads: 1
})

const jsonFromMultiPart = (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body.body === 'string') {
    try {
      req.body = JSON.parse(req.body.body)
    } catch (err: any) {
      throw httpError(400, 'error parsing body: ' + err.message)
    }
  }
  next()
}

const mutableQuery = (req: Request, res: Response, next: NextFunction) => {
  // just a little trick as we want to coerce type in req.query
  Object.defineProperty(req, 'query', { ...Object.getOwnPropertyDescriptor(req, 'query'), value: req.query, writable: true })
  next()
}

router.post('', upload.single('image'), jsonFromMultiPart, mutableQuery, async (req, res, next) => {
  const session = reqSessionAuthenticated(req)

  const { body, query, file } = postReq.returnValid(req, { name: 'request' })
  const ownerFilter = { 'owner.type': session.account.type, 'owner.id': session.account.id, 'owner.department': session.account.department }
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
    owner: { ...session.account, department: undefined, departmentName: undefined },
    created,
    updated: created,
    name: file.originalname,
    ...body,
    ...(await resizePiscina.run({ filePath: file.path, width: query.width, height: query.height }))
  }

  // prepare mobile variant if necessary
  const mobileBreakpoint = 1280
  if (image.width > (mobileBreakpoint * 1.2)) {
    image.mobileAlt = true
    const imageMobile = {
      ...image,
      _id: image._id + '-mobile',
      ...(await resizePiscina.run({ filePath: file.path, width: mobileBreakpoint, height: query.height }))
    }
    await mongo.images.insertOne(imageMobile)
  }
  await mongo.images.insertOne(image)

  res.json({ ...image, data: undefined })
})

router.get('/:id/data', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)

  const image = await mongo.images.findOne({ _id: req.params.id, 'owner.type': session.account.type, 'owner.id': session.account.id, 'owner.department': session.account.department })
  if (!image) throw httpError(404, 'image not found')

  res.type(image.mimeType).setHeader('Cache-Control', 'private, max-age=604800, immutable').send(image.data.buffer)
})
