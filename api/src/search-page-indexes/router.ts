import { Router } from 'express'
import mongo from '#mongo'
import findUtils from '../utils/find.ts'
import { reqSessionAuthenticated, assertAccountRole } from '@data-fair/lib-express/index.js'

const router = Router()
export default router

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
