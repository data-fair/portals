// The draft configs of portals and pages as whole documents, with the JSON Schemas of their forms:
// what an editor tool group (openapi-mcp x-agent.editor) reads, edits as a form and saves at once.
// The GET answers exactly the document the PUT accepts.
import { Router } from 'express'
import * as pagePatchReqBody from '#doc/pages/patch-req-body/index.ts'
import * as portalPatchReqBody from '#doc/portals/patch-req-body/index.ts'
import { reqSessionAuthenticated, reqOrigin, allowAnyScope } from '@data-fair/lib-express'
import { requireOperationScope } from '../scopes.ts'
import { getPageAsContrib, patchPage } from '../pages/service.ts'
import { getPortalAsAdmin, patchPortal } from '../portals/service.ts'
import { syncHeaders } from '../portals/operations.ts'
import { pageConfigSchema, portalConfigSchema } from './service.ts'

const router = Router()
export default router

router.get('/pages/:id/draft-config', requireOperationScope('getPageDraftConfig'), async (req, res) => {
  const page = await getPageAsContrib(reqSessionAuthenticated(req), req.params.id)
  res.send(page.draftConfig)
})

router.put('/pages/:id/draft-config', requireOperationScope('putPageDraftConfig'), async (req, res) => {
  const session = reqSessionAuthenticated(req)
  const page = await getPageAsContrib(session, req.params.id)
  const { draftConfig } = pagePatchReqBody.returnValid({ draftConfig: req.body }, { name: 'body' })
  const updatedPage = await patchPage(page, { draftConfig }, session)
  res.send(updatedPage.draftConfig)
})

// the form depends on the page type (metadata of events, news and free pages), the page decides it
router.get('/pages/:id/draft-config/schema', requireOperationScope('getPageConfigSchema'), async (req, res) => {
  const page = await getPageAsContrib(reqSessionAuthenticated(req), req.params.id)
  res.set('Cache-Control', 'private, max-age=300')
  res.send(await pageConfigSchema(page.type))
})

router.get('/portals/config-schema.json', allowAnyScope, async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300')
  res.send(await portalConfigSchema())
})

router.get('/portals/:id/draft-config', requireOperationScope('getPortalDraftConfig'), async (req, res) => {
  const portal = await getPortalAsAdmin(reqSessionAuthenticated(req), req.params.id)
  res.send(portal.draftConfig)
})

router.put('/portals/:id/draft-config', requireOperationScope('putPortalDraftConfig'), async (req, res) => {
  const session = reqSessionAuthenticated(req)
  const portal = await getPortalAsAdmin(session, req.params.id)
  const { draftConfig } = portalPatchReqBody.returnValid({ draftConfig: req.body }, { name: 'body' })
  const updatedPortal = await patchPortal(portal, { draftConfig }, session, reqOrigin(req), [], syncHeaders(req))
  res.send(updatedPortal.draftConfig)
})
