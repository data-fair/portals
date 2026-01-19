import { Router } from 'express'
import * as postReqBody from '#doc/font-assets/post-req-body/index.js'
import mongo from '#mongo'
import findUtils from '../utils/find.ts'
import { httpError, reqSessionAuthenticated, assertAccountRole } from '@data-fair/lib-express/index.js'
import { jsonFromMultiPart, upload } from '../utils/multipart.ts'
import { randomUUID } from 'node:crypto'
import { type FontAsset } from '#types/font-asset/index.js'
import { readFile, unlink } from 'node:fs/promises'

const router = Router()
export default router

router.get('', async (req, res) => {
  const session = reqSessionAuthenticated(req)
  assertAccountRole(session, session.account, 'admin')

  const params = req.query as Record<string, string>
  const sort = findUtils.sort(params.sort || 'name:1')
  const { skip, size } = findUtils.pagination(params, 1000)
  const query = findUtils.filterPermissions(params, session)

  const [results, count] = await Promise.all([
    mongo.fontAssets.find(query).skip(skip).limit(size).skip(skip).sort(sort).toArray(),
    mongo.fontAssets.countDocuments(query)
  ])

  res.json({ results, count })
})

router.post('', upload.single('font-asset'), jsonFromMultiPart, async (req, res, next) => {
  const session = reqSessionAuthenticated(req)

  const body = postReqBody.returnValid(req.body, { name: 'body' })
  const file = req.file
  if (!file) throw httpError(400, 'missing font-asset file')

  const createdAt = new Date().toISOString()
  const fontAsset: FontAsset = {
    _id: randomUUID(),
    owner: { ...session.account, department: undefined, departmentName: undefined },
    createdAt,
    ...body,
    data: await readFile(file.path)
  }

  await mongo.fontAssets.insertOne(fontAsset)
  await unlink(file.path)

  res.json({ ...fontAsset, data: undefined })
})

router.delete('/:id', async (req, res) => {
  const session = reqSessionAuthenticated(req)
  const fontAsset = await mongo.fontAssets.findOne({ _id: req.params.id })
  if (!fontAsset) throw httpError(404, `Font asset "${req.params.id}" not found`)
  assertAccountRole(session, fontAsset.owner, 'admin')
  await mongo.fontAssets.deleteOne({ _id: req.params.id })
  res.status(204).send()
})

router.get('/:id/data', async (req, res) => {
  const session = reqSessionAuthenticated(req)
  const fontAsset = await mongo.fontAssets.findOne({ _id: req.params.id })
  if (!fontAsset) throw httpError(404, `Font asset "${req.params.id}" not found`)
  assertAccountRole(session, fontAsset.owner, 'admin')
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable') // 365 days
  // force buffering (necessary for caching) of this response in the reverse proxy
  res.setHeader('X-Accel-Buffering', 'yes')
  if (fontAsset.file.type) res.type(fontAsset.file.type)
  res.send(fontAsset.data.buffer)
})
