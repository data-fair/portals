import { Router } from 'express'
import mongo from './mongo.ts'
import { clearPreviewLimits } from './pages/preview.ts'

const router = Router()

router.delete('/', async (req, res) => {
  const testOwnerFilter = { 'owner.id': { $regex: /^test_/ } }

  for (const name of ['portals', 'pages', 'reuses', 'groups', 'font-assets', 'images']) {
    await mongo.db.collection(name).deleteMany(testOwnerFilter)
  }
  await mongo.limits.deleteMany({ id: { $regex: /^test_/ } })
  clearPreviewLimits()

  res.status(204).send()
})

export default router
