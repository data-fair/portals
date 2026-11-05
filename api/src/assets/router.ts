import type { Readable } from 'node:stream'
import type { Asset } from './types.ts'
import { randomUUID } from 'node:crypto'
import { PassThrough } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { Router } from 'express'
import { httpError, reqSessionAuthenticated } from '@data-fair/lib-express/index.js'
import mongo from '#mongo'
import config from '#config'
import { deleteObject, readObject, uploadObject } from './s3.ts'

const router = Router()
export default router

const allowedMimeTypes = ['video/mp4', 'video/webm', 'image/webp', 'image/jpeg']

// the body is the raw file: it goes straight to S3 without a temporary file on the pod
router.post('', async (req, res) => {
  const session = reqSessionAuthenticated(req)
  const mimeType = req.get('content-type')?.split(';')[0] ?? ''
  if (!allowedMimeTypes.includes(mimeType)) throw httpError(415, `unsupported media type ${mimeType}`)
  const declaredSize = Number(req.get('content-length'))
  if (declaredSize > config.assetMaxSize) throw httpError(413, 'file too large')

  const _id = randomUUID()
  const key = `${session.account.type}/${session.account.id}/${_id}`
  let size = 0
  const counter = new PassThrough()
  counter.on('data', (chunk: Buffer) => {
    size += chunk.length
    if (size > config.assetMaxSize) counter.destroy(httpError(413, 'file too large'))
  })
  await Promise.all([
    pipeline(req, counter),
    uploadObject(key, counter, mimeType)
  ])

  const numberParam = (name: string) => {
    const value = Number(req.query[name])
    return Number.isFinite(value) && value > 0 ? value : undefined
  }
  const asset: Asset = {
    _id,
    owner: session.account,
    name: String(req.query.name ?? _id),
    key,
    mimeType,
    size,
    width: numberParam('width'),
    height: numberParam('height'),
    duration: numberParam('duration'),
    createdAt: new Date().toISOString()
  }
  await mongo.assets.insertOne(asset)
  res.status(201).json(asset)
})

const findOwnAsset = async (req: Parameters<typeof reqSessionAuthenticated>[0], id: string) => {
  const session = reqSessionAuthenticated(req)
  const asset = await mongo.assets.findOne({ _id: id, 'owner.type': session.account.type, 'owner.id': session.account.id })
  if (!asset) throw httpError(404, 'asset not found')
  return asset
}

router.get('/:id/data', async (req, res) => {
  const asset = await findOwnAsset(req, req.params.id)
  const object = await readObject(asset.key, req.get('range'))
  res.status(object.ContentRange ? 206 : 200)
  res.type(asset.mimeType)
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Content-Length', String(object.ContentLength))
  if (object.ContentRange) res.setHeader('Content-Range', object.ContentRange)
  res.setHeader('Cache-Control', 'private, max-age=31536000, immutable')
  res.setHeader('X-Accel-Buffering', 'no')
  await pipeline(object.Body as Readable, res)
})

router.delete('/:id', async (req, res) => {
  const asset = await findOwnAsset(req, req.params.id)
  await deleteObject(asset.key)
  await mongo.assets.deleteOne({ _id: asset._id })
  res.status(204).send()
})
