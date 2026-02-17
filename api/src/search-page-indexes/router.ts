import { Router, type Request } from 'express'
import mongo from '#mongo'
import findUtils from '../utils/find.ts'
import { reqSessionAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express/index.js'
import config from '#config'
import * as reindexReqBody from '#doc/search-page-indexes/reindex-req-body/index.ts'
import { createOrUpdateSearchPageRef, type CreateSearchPageRefParams } from './service.ts'

const router = Router()
export default router

const assertReqInternalSecret = (req: Request, knownSecret: string) => {
  const secret = req.headers['x-internal-secret'] as string
  if (!secret || secret !== knownSecret) {
    throw httpError(403, 'invalid internal secret')
  }
}

router.get('', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  assertAccountRole(session, session.account, 'admin')

  const params = req.query as Record<string, string>
  const sort = findUtils.sort(params.sort || 'indexedAt:-1')
  const { skip, size } = findUtils.pagination(params)
  const project = findUtils.project(params.select)
  const filters = findUtils.query(params)

  if (params.status) {
    filters.indexingStatus = params.status
  }

  const query = findUtils.filterPermissions(params, session)
  const queryWithFilters = { ...filters, ...query }

  const [count, results] = await Promise.all([
    mongo.searchPageRefs.countDocuments(queryWithFilters),
    mongo.searchPageRefs.find(queryWithFilters).project(project).skip(skip).limit(size).sort(sort).toArray()
  ])

  res.json({ results, count })
})

router.post('/reindex', async (req, res, next) => {
  assertReqInternalSecret(req, config.secretKeys.searchPageIndex)

  const body = reindexReqBody.returnValid(req.body, { name: 'body' }) as CreateSearchPageRefParams

  await createOrUpdateSearchPageRef(body)

  res.status(204).send()
})
