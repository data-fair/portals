import { Router, type Request } from 'express'
import mongo from '#mongo'
import findUtils from '../utils/find.ts'
import { reqSessionAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express/index.js'
import config from '#config'
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

  const body = req.body as {
    portal: string
    owner: CreateSearchPageRefParams['owner']
    resource: CreateSearchPageRefParams['resource']
    path: string
    public?: boolean
    privateAccess?: CreateSearchPageRefParams['privateAccess']
  }

  if (!body.portal || !body.owner || !body.resource || !body.path) {
    throw httpError(400, 'portal, owner, resource and path are required')
  }

  await createOrUpdateSearchPageRef({
    portal: body.portal,
    owner: body.owner,
    resource: body.resource,
    path: body.path,
    public: body.public,
    privateAccess: body.privateAccess
  })

  res.status(204).send()
})
