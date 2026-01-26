import type { Filter } from 'mongodb'
import type { Portal, PortalConfig } from '#types/portal/index.ts'

import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import mongo from '#mongo'
import config from '#config'
import findUtils from '../utils/find.ts'
import * as postReqBody from '#doc/portals/post-req-body/index.ts'
import * as patchReqBody from '#doc/portals/patch-req-body/index.ts'
import * as postIngressReqBody from '#types/portal-ingress/index.ts'
import { httpError, reqSessionAuthenticated, assertAccountRole, assertAdminMode, reqOrigin } from '@data-fair/lib-express'
import { defaultTheme, fillTheme } from '@data-fair/lib-common-types/theme/index.js'
import { createPortal, validatePortalDraft, cancelPortalDraft, getPortalAsAdmin, patchPortal, deletePortal, sendPortalEvent, duplicatePortalConfig } from './service.ts'

const router = Router()
export default router

router.get('', async (req, res, next) => {
  const sessionState = reqSessionAuthenticated(req)
  const { account, accountRole } = sessionState
  if (accountRole !== 'admin') throw httpError(403, 'admin only')

  // TODO: account filter for super admins ?
  const showAll = req.query.showAll === 'true' || req.query.showAll === '1'
  if (showAll && !sessionState.user.adminMode) throw httpError(403, 'only super admins can use showAll parameter')
  const query: Filter<Portal> = showAll ? {} : { 'owner.type': account.type, 'owner.id': account.id }
  // if (req.query.q && typeof req.query.q === 'string') query.$text = { $search: req.query.q, $language: lang || config.i18n.defaultLocale }

  const project = findUtils.project(req.query.select)
  const sort = findUtils.sort(req.query.sort || 'createdAt:-1')
  const { skip, size } = findUtils.pagination(req.query)

  const [count, portals] = await Promise.all([
    mongo.portals.countDocuments(query),
    mongo.portals.find(query).project(project).skip(skip).limit(size).sort(sort).toArray()
  ])

  const response: any = { count, results: portals }

  res.json(response)
})

router.post('', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)

  const body = postReqBody.returnValid(req.body, { name: 'body' })

  const initialConfig: PortalConfig = {
    title: body.config.title,
    menu: {
      children: []
    },
    allowRobots: !body.config, // By default, allow robots if not a staging portal
    authentication: 'optional' as const,
    theme: fillTheme(defaultTheme, defaultTheme),
    header: {},
    navBar: {},
    breadcrumb: {},
    footer: {
      color: 'primary',
      socialPosition: 'none',
      copyright: 'text',
      logoPrimaryType: 'default',
      extraLogos: [],
      linksMode: 'lines',
      links: [{ type: 'standard', subtype: 'sitemap', title: 'Plan du site' }],
      importantLinks: []
    },
    datasets: {
      card: {},
      page: {
        metadata: {
          actionButtons: ['download', 'api', 'embed', 'notifications', 'attachments', 'table', 'map', 'schema']
        }
      }
    },
    applications: {
      card: {},
      page: {}
    },
    reuses: {
      card: {},
      page: {}
    },
    socialShares: ['bluesky', 'x', 'facebook', 'linkedin', 'reddit', 'sms', 'whatsapp'],
    socialLinks: {},
    contactInformations: {},
    personal: {
      navigationColor: 'primary',
      hidePages: ['contribute', 'processings'],
      accountPages: []
    }
  }

  // Prepare config by applying overrides in the expected order:
  // 1) initialConfig
  // 2) duplicated portal config (if any)
  // 3) body.config
  let config = { ...initialConfig }
  const portalId = randomUUID()
  const owner = body.owner ?? session.account

  // Handle portal duplication if sourcePortalId is provided
  let duplicationEventDetails: string | undefined
  if (body.sourcePortalId) {
    const { config: duplicatedConfig, eventDetails } = await duplicatePortalConfig(session, body.sourcePortalId, portalId, owner)
    config = { ...config, ...duplicatedConfig }
    duplicationEventDetails = eventDetails
  }

  // Finally apply explicit body config overrides
  config = { ...config, ...body.config }

  const portal: Portal = {
    _id: portalId,
    title: config.title,
    owner,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config,
    draftConfig: config
  }
  assertAccountRole(session, portal.owner, 'admin')

  await createPortal(portal, reqOrigin(req), req.headers.cookie)
  sendPortalEvent(portal, 'a été créé', 'create', session, duplicationEventDetails)
  res.status(201).json(portal)
})

router.get('/:id', async (req, res, next) => {
  res.send(await getPortalAsAdmin(reqSessionAuthenticated(req), req.params.id))
})

/**
 * Get public info about a portal (_id, title and url)
 */
router.get('/:id/public', async (req, res, next) => {
  const portal = await mongo.portals.findOne({ _id: req.params.id })
  if (!portal) throw httpError(404, 'portal not found')

  let url = ''
  if (portal.ingress?.url) url = portal.ingress.url
  else url = config.portalUrlPattern.replace('{subdomain}', portal._id)

  res.json({
    _id: portal._id,
    title: portal.config.title,
    owner: portal.owner,
    url
  })
})

router.patch('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const portal = await getPortalAsAdmin(session, req.params.id)
  const body = patchReqBody.returnValid(req.body, { name: 'body' })
  const updatedPortal = await patchPortal(portal, body, session, reqOrigin(req), [], req.headers.cookie)

  // Send patch event only if not just draft changed
  const onlyDraftChanged = Object.keys(body).length === 1 && body.draftConfig
  if (!onlyDraftChanged) {
    sendPortalEvent(updatedPortal, 'a été modifié', 'patch', session, 'Modifications : ' + Object.keys(body).join(', '))
  }

  res.send(updatedPortal)
})

router.delete('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const portal = await getPortalAsAdmin(session, req.params.id)
  await deletePortal(portal, reqOrigin(req), req.headers.cookie)
  sendPortalEvent(portal, 'a été supprimé', 'delete', session)
  res.status(201).send()
})

router.post('/:id/draft', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const portal = await getPortalAsAdmin(session, req.params.id)
  await validatePortalDraft(portal, session, reqOrigin(req), req.headers.cookie)
  res.status(201).send()
})

router.delete('/:id/draft', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const portal = await getPortalAsAdmin(session, req.params.id)
  await cancelPortalDraft(portal, session, reqOrigin(req), req.headers.cookie)
  res.status(201).send()
})

router.post('/:id/ingress', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  assertAdminMode(session)
  const portal = await getPortalAsAdmin(reqSessionAuthenticated(req), req.params.id)
  const ingress = postIngressReqBody.returnValid(req.body, { name: 'body' })
  await patchPortal(portal, { ingress }, session, reqOrigin(req), ['ingress'], req.headers.cookie)
  res.status(201).send()
})
