import config from '#config'
import { type Request, type Response, type NextFunction } from 'express'
import { httpError } from '@data-fair/lib-express/index.js'
import multer from 'multer'

export const jsonFromMultiPart = (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body.body === 'string') {
    try {
      req.body = JSON.parse(req.body.body)
    } catch (err: any) {
      throw httpError(400, 'error parsing body: ' + err.message)
    }
  }
  next()
}

export const upload = multer({ dest: config.tmpDir })
