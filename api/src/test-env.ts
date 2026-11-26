import { Router } from 'express'
import mongo from './mongo.ts'
import { clearPreviewLimits } from './pages/preview.ts'

const router = Router()

// Prefixed test sub-spaces: a test suite owns the accounts whose ids start with its own prefix (test_<suite>_)
// and the data they own, cleaned without touching the other sub-spaces nor the unprefixed accounts
const testPrefixRegexp = /^test_[a-z0-9]+(?:_[a-z0-9]+)*_$/

// DELETE /?prefix=test_<suite>_: delete the data owned by the accounts of a sub-space, then reset the preview
// rate limits (a global reset, it only costs a recomputation to the other sub-spaces)
router.delete('/', async (req, res) => {
  const prefix = req.query.prefix
  if (typeof prefix !== 'string' || !testPrefixRegexp.test(prefix)) {
    res.status(400).type('text/plain').send('invalid test prefix')
    return
  }
  // the prefix only holds [a-z0-9_], safe in a regexp
  const prefixRegexp = new RegExp('^' + prefix)

  const testOwnerFilter = { 'owner.id': { $regex: prefixRegexp } }
  for (const name of ['portals', 'pages', 'reuses', 'groups', 'font-assets', 'images']) {
    await mongo.db.collection(name).deleteMany(testOwnerFilter)
  }
  await mongo.limits.deleteMany({ id: { $regex: prefixRegexp } })
  clearPreviewLimits()

  res.status(204).send()
})

export default router
