import { Router } from 'express'
import mongo from './mongo.ts'
import es from './es.ts'

const router = Router()

router.delete('/', async (req, res) => {
  const testOwnerFilter = { 'owner.id': { $regex: /^test_/ } }

  // collect test-owned portal IDs for ES cleanup
  const testPortals = await mongo.db.collection('portals').find(testOwnerFilter, { projection: { _id: 1 } }).toArray()

  for (const name of ['portals', 'pages', 'reuses', 'search-pages', 'groups', 'font-assets', 'images']) {
    await mongo.db.collection(name).deleteMany(testOwnerFilter)
  }

  // delete ES indices only for test-owned portals
  if (testPortals.length > 0) {
    const indexPattern = testPortals.map(p => `portal-search-${p._id}*`).join(',')
    await es.client.indices.delete({ index: indexPattern, ignore_unavailable: true })
  }

  res.status(204).send()
})

export default router
