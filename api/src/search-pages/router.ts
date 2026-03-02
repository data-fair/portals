import { Router, type Request } from 'express'
import mongo from '#mongo'
import findUtils from '../utils/find.ts'
import { reqSessionAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express/index.js'
import config from '#config'
import * as postSearchPage from '@data-fair/types-portals/post-search-page/index.js'
import { createOrUpdateSearchPage } from './service.ts'

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
  const filters = findUtils.query(params, { portal: 'portal' })

  if (params.status) {
    filters.indexingStatus = params.status
  }

  const query = findUtils.filterPermissions(params, session)
  const queryWithFilters = { ...filters, ...query }

  const [count, results] = await Promise.all([
    mongo.searchPages.countDocuments(queryWithFilters),
    mongo.searchPages.find(queryWithFilters).project(project).skip(skip).limit(size).sort(sort).toArray()
  ])

  res.json({ results, count })
})

router.post('', async (req, res, next) => {
  if (!config.secretKeys.searchPage) throw new Error('searchPage secret is missing')
  assertReqInternalSecret(req, config.secretKeys.searchPage)

  const body = postSearchPage.returnValid(req.body, { name: 'body' })

  const path = body.indexingStatus !== 'toDelete' ? `/${body.resource.type}s/${body.resource.id}` : undefined

  await createOrUpdateSearchPage({
    portal: body.portal,
    owner: body.owner,
    resource: body.resource,
    path,
    public: body.public,
    privateAccess: body.privateAccess,
    indexingStatus: body.indexingStatus
  })

  res.status(204).send()
})
