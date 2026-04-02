import { Router } from 'express'
import mongo from './mongo.ts'
import es from './es.ts'

const router = Router()

router.delete('/', async (req, res) => {
  for (const name of ['portals', 'pages', 'reuses', 'search-pages', 'groups', 'font-assets', 'images']) {
    await mongo.db.collection(name).deleteMany({})
  }
  await es.client.indices.delete({ index: 'portal-search-*', ignore_unavailable: true })
  res.status(204).send()
})

export default router
