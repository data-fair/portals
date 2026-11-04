import config from '#config'
import { type Request, type Response, type NextFunction } from 'express'
import { httpError } from '@data-fair/lib-express/index.js'
import multer from 'multer'
import { unlink } from 'node:fs/promises'

export const jsonFromMultiPart = async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body.body === 'string') {
    let body: unknown
    try {
      body = JSON.parse(req.body.body)
    } catch (err: any) {
      await refuseUpload(req, 'error parsing body: ' + err.message)
    }
    // "null", a number or an array would reach the routes that read body properties (500)
    if (!body || typeof body !== 'object' || Array.isArray(body)) await refuseUpload(req, 'the body part must be a JSON object')
    req.body = body
  }
  next()
}

// a refused upload does not leave its file in the temporary directory
const refuseUpload = async (req: Request, message: string): Promise<never> => {
  if (req.file) await unlink(req.file.path).catch(() => {})
  throw httpError(400, message)
}

/**
 * Multer upload middleware configured to store files in the temporary directory
 * with a maximum file size of 50 MB.
 */
export const upload = multer({ dest: config.tmpDir, limits: { fileSize: 50 * 1024 * 1024 } })
