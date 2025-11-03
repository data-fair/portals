import { reqSessionAuthenticated } from '@data-fair/lib-express'
import { Router } from 'express'
import { getFontNames, getFontFamilyCss } from './service.ts'

const router = Router()
export default router

router.get('', async (req, res) => {
  const session = reqSessionAuthenticated(req)
  res.send(await getFontNames(session.account))
})

router.get('/:name/css', async (req, res) => {
  const session = reqSessionAuthenticated(req)
  res.send(await getFontFamilyCss(session.account, req.params.name, true))
})
