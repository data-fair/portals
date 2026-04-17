import { Router } from 'express'
import mongo from './mongo.ts'

const router = Router()

router.delete('/', async (req, res) => {
  const testOwnerFilter = { 'owner.id': { $regex: /^test_/ } }

  for (const name of ['portals', 'pages', 'reuses', 'groups', 'font-assets', 'images']) {
    await mongo.db.collection(name).deleteMany(testOwnerFilter)
  }

  res.status(204).send()
})

export default router
