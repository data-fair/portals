import type { Filter, Sort } from 'mongodb'
import type { Portal, PortalConfig } from '#types/portal/index.ts'

import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import mongo from '#mongo'
import * as postReqBody from '#doc/portals/post-req-body/index.ts'
import * as patchReqBody from '#doc/portals/patch-req-body/index.ts'
import * as postIngressReqBody from '#types/portal-ingress/index.ts'
import { mongoPagination, mongoProjection, httpError, reqSessionAuthenticated, assertAccountRole, assertAdminMode, reqOrigin } from '@data-fair/lib-express'
import { defaultTheme, fillTheme } from '@data-fair/lib-common-types/theme/index.js'
import { createPortal, validatePortalDraft, cancelPortalDraft, getPortalAsAdmin, patchPortal, deletePortal } from './service.ts'

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

  const project = mongoProjection(req.query.select)

  // implement a special pagination based on the fact that we always sort by date
  const sort: Sort = { _id: -1 }
  const { skip, size } = mongoPagination(req.query, 20)

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
  const created = {
    id: session.user.id,
    name: session.user.name,
    date: new Date().toISOString()
  }

  const initialConfig: PortalConfig = {
    ...body.config,
    authentication: 'optional' as const,
    theme: fillTheme(defaultTheme, defaultTheme),
    menu: {
      children: [
        { type: 'standard', subtype: 'home', title: 'accueil' },
        { type: 'standard', subtype: 'datasets', title: 'jeux de données' },
        { type: 'standard', subtype: 'applications', title: 'visualisations' },
        { type: 'standard', subtype: 'contact', title: 'contact' }
      ]
    },
    header: {
      show: false,
      logoPrimaryType: 'default',
      showTitle: true,
      headerColor: 'navBar',
      navBarColor: 'primary',
      density: 'default',
      scrollBehavior: 'hide'
    },
    headerHome: { active: false },
    footer: {
      color: 'primary',
      showSocial: false,
      copyright: 'text',
      logoPrimaryType: 'default',
      extraLogos: [],
      linksMode: 'lines',
      links: [{ type: 'standard', subtype: 'sitemap', title: 'Plan du site' }, { type: 'standard', subtype: 'privacy-policy', title: 'Politique de confidentialité' }],
      importantLinks: []
    },
    datasets: {
      filtersLocation: 'top',
      defaultSort: 'dataUpdatedAt',
      columns: 0,
      thumbnailLocation: 'center',
      cropThumbnails: false,
      showSummary: false,
      actionsLocation: 'bottom',
      metadataPosition: 'right',
      showImage: false,
      showDepartment: false,
      actionsStyle: 'text'
    },
    applications: {
      cardsLayout: 'vertical',
      filtersLocation: 'top',
      defaultSort: 'createdAt',
      actionsLocation: 'bottom',
      cropThumbnails: true,
      metadataPosition: 'right',
      showImage: false,
      showDepartment: true,
      actionsStyle: 'full'
    },
    socialShares: ['bluesky', 'x', 'facebook', 'linkedin', 'reddit', 'sms', 'whatsapp'],
    socialLinks: {},
    contactInformations: {},
    personal: {
      navigationColor: 'primary',
      hidePages: [],
      accountPages: []
    }
  }

  const portal: Portal = {
    _id: randomUUID(),
    title: initialConfig.title,
    owner: session.account,
    created,
    updated: created,
    ...body,
    config: initialConfig,
    draftConfig: initialConfig
  }
  assertAccountRole(session, portal.owner, 'admin')

  await createPortal(portal, reqOrigin(req), req.headers.cookie)

  res.status(201).json(portal)
})

router.get('/:id', async (req, res, next) => {
  res.send(await getPortalAsAdmin(reqSessionAuthenticated(req), req.params.id))
})

router.patch('/:id', async (req, res, next) => {
  const session = reqSessionAuthenticated(req)
  const portal = await getPortalAsAdmin(session, req.params.id)
  const body = patchReqBody.returnValid(req.body, { name: 'body' })
  const updatedPortal = await patchPortal(portal, body, session, reqOrigin(req), req.headers.cookie)
  res.send(updatedPortal)
})

router.delete('/:id', async (req, res, next) => {
  const portal = await getPortalAsAdmin(reqSessionAuthenticated(req), req.params.id)
  await deletePortal(portal, reqOrigin(req), req.headers.cookie)
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
  await patchPortal(portal, { ingress }, session, reqOrigin(req), req.headers.cookie)
  res.status(201).send()
})
