import type { Portal } from '#types/portal/index.ts'
import type { ImageRef } from '#types/image-ref/index.ts'
import type { IngressManagerIngressInfo } from '#types'

import debugModule from 'debug'
import equal from 'fast-deep-equal'
import { type SessionStateAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express'
import axios from '@data-fair/lib-node/axios.js'
import { defaultTheme, fillTheme } from '@data-fair/lib-common-types/theme/index.js'
import mongo from '#mongo'
import config from '#config'
import { getFontFamilyCss } from '../fonts/service.ts'

const debug = debugModule('portals')
const debugSyncPortal = debugModule('sync-portal')

export const getPortalAsAdmin = async (sessionState: SessionStateAuthenticated, id: string) => {
  const portal = await mongo.portals.findOne({ _id: id })
  if (!portal) throw httpError(404, `portal "${id}" not found`)
  assertAccountRole(sessionState, portal.owner, 'admin')
  return portal
}

export const createPortal = async (portal: Portal, reqOrigin: string, cookie?: string) => {
  debug('createPortal', portal)
  await syncPortalUpdate(portal, null, reqOrigin, [], cookie)
  await mongo.portals.insertOne(portal)
}

export const patchPortal = async (portal: Portal, patch: Partial<Portal>, session: SessionStateAuthenticated, reqOrigin: string, forceSync: SyncPart[], cookie?: string) => {
  if (patch.owner) {
    assertAccountRole(session, patch.owner, 'admin')
    await mongo.images.updateMany(
      {
        'owner.type': portal.owner.type,
        'owner.id': portal.owner.id,
        'resource.type': 'portal',
        'resource._id': portal._id
      },
      {
        $set: {
          'owner.type': patch.owner.type,
          'owner.id': patch.owner.id
        }
      }
    )
  }

  const fullPatch = {
    ...patch,
    updated: { id: session.user.id, name: session.user.name, date: new Date().toISOString() }
  }
  if (fullPatch.draftConfig) {
    fullPatch.draftConfig.theme = fillTheme(fullPatch.draftConfig.theme, defaultTheme)
  }
  const updatedPortal = { ...portal, ...fullPatch }
  // we propagate before storing as it has a greater probability of failing and we prefer a cohesive state
  await syncPortalUpdate(updatedPortal, portal, reqOrigin, forceSync, cookie)
  await mongo.portals.updateOne({ _id: portal._id }, { $set: fullPatch })
  return updatedPortal
}

export const deletePortal = async (portal: Portal, reqOrigin: string, cookie?: string) => {
  debug('deletePortal', portal)
  await syncPortalDelete(portal, reqOrigin, cookie)
  await mongo.images.deleteMany({
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    'resource.type': 'portal',
    'resource._id': portal._id
  })
  await mongo.portals.deleteOne({ _id: portal._id })
}

export const validatePortalDraft = async (portal: Portal, session: SessionStateAuthenticated, reqOrigin: string, cookie?: string) => {
  debug('validatePortalDraft', portal)
  const updatedPortal = await patchPortal(portal, { config: portal.draftConfig, title: portal.draftConfig.title }, session, reqOrigin, [], cookie)
  await cleanUnusedImages(updatedPortal)
  return updatedPortal
}

export const cancelPortalDraft = async (portal: Portal, session: SessionStateAuthenticated, reqOrigin: string, cookie?: string) => {
  debug('cancelPortalDraft', portal)
  const updatedPortal = await patchPortal(portal, { draftConfig: portal.config }, session, reqOrigin, [], cookie)
  await cleanUnusedImages(updatedPortal)
  return updatedPortal
}

const getPublicationSite = (portal: Portal) => {
  const refType = portal.ingress ? 'slug' : 'id'
  const draftUrl = config.portalUrlPattern.replace('{subdomain}', portal._id + '.draft')
  const url = portal.ingress ? portal.ingress.url : config.portalUrlPattern.replace('{subdomain}', portal._id)
  const publicationSite: any = {
    type: 'data-fair-portals',
    id: portal._id,
    title: portal.config.title,
    url,
    draftUrl,
    datasetUrlTemplate: url + `/datasets/{${refType}}`,
    applicationUrlTemplate: url + `/applications/{${refType}}`
  }
  if (portal.config && portal.config.authentication === 'required') {
    publicationSite.private = true
  }
  return publicationSite
}

const getImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}

const getSDSites = async (portal: Portal) => {
  const sites = [{
    _id: 'data-fair-portals:draft-' + portal._id,
    owner: portal.owner,
    host: new URL(config.portalUrlPattern.replace('{subdomain}', portal._id + '.draft')).host,
    title: portal.draftConfig.title + ' (brouillon)',
    theme: {
      ...portal.draftConfig.theme,
      logo: portal.draftConfig.logo && getImageSrc(portal.draftConfig.logo, true),
      bodyFontFamily: portal.draftConfig.bodyFontFamily,
      bodyFontFamilyCss: portal.draftConfig.bodyFontFamily && await getFontFamilyCss(portal.owner, portal.draftConfig.bodyFontFamily),
      headingFontFamily: portal.draftConfig.headingFontFamily,
      headingFontFamilyCss: portal.draftConfig.headingFontFamily && await getFontFamilyCss(portal.owner, portal.draftConfig.headingFontFamily)
    },
    contact: portal.draftConfig.contactInformations.email
  }]
  sites.push({
    _id: 'data-fair-portals:' + portal._id,
    owner: portal.owner,
    host: portal.ingress ? new URL(portal.ingress.url).host : new URL(config.portalUrlPattern.replace('{subdomain}', portal._id)).host,
    title: portal.config.title,
    theme: {
      ...portal.config.theme,
      logo: portal.config.logo && getImageSrc(portal.config.logo, true),
      bodyFontFamily: portal.config.bodyFontFamily,
      bodyFontFamilyCss: portal.config.bodyFontFamily && await getFontFamilyCss(portal.owner, portal.config.bodyFontFamily),
      headingFontFamily: portal.config.headingFontFamily,
      headingFontFamilyCss: portal.config.headingFontFamily && await getFontFamilyCss(portal.owner, portal.config.headingFontFamily)
    },
    contact: portal.config.contactInformations.email
  })
  return sites
}

const getIngressInfos = (portal: Portal) => {
  const ingressInfos: IngressManagerIngressInfo[] = [{
    url: config.portalUrlPattern.replace('{subdomain}', portal._id + '.draft'),
    owner: portal.owner,
    _id: portal._id + '--draft',
    waf: 'off'
  }]
  if (portal.ingress) {
    ingressInfos.push({
      url: portal.ingress.url,
      owner: portal.owner,
      _id: portal._id,
      controller: portal.ingress.controller,
      redirects: portal.ingress.redirects,
      blockedIps: portal.ingress.blockedIps,
      waf: portal.ingress.waf ?? 'off'
    })
  } else {
    ingressInfos.push({
      url: config.portalUrlPattern.replace('{subdomain}', portal._id),
      owner: portal.owner,
      _id: portal._id,
      waf: 'off'
    })
  }
  return ingressInfos
}

type SyncPart = 'ingress' | 'sd' | 'df'

// portals are synced to settings.publicationSites in data-fair and to a dataset containing images
export async function syncPortalUpdate (portal: Portal, previousPortal: Portal | null, reqOrigin: string, forceSync: SyncPart[], cookie?: string) {
  debugSyncPortal('sync portal update', portal)

  const publicationSite = getPublicationSite(portal)
  if (!forceSync.includes('df') && equal(publicationSite, previousPortal && getPublicationSite(previousPortal))) {
    debugSyncPortal('nothing new to sync to data-fair', publicationSite)
  } else {
    debugSyncPortal('sync to data-fair', publicationSite)
    const ownerId = portal.owner.department ? encodeURIComponent(`${portal.owner.id}:${portal.owner.department}`) : portal.owner.id
    await axios.post(
      `${reqOrigin}/data-fair/api/v1/settings/${portal.owner.type}/${ownerId}/publication-sites`,
      publicationSite,
      { headers: { cookie } }
    )
  }

  const sdSites = await getSDSites(portal)
  if (!forceSync.includes('sd') && equal(sdSites, previousPortal && await getSDSites(previousPortal))) {
    debugSyncPortal('nothing new to sync to SD', sdSites)
  } else {
    for (const site of sdSites) {
      debugSyncPortal('sync to SD', site)
      await axios.post(
        `${config.privateDirectoryUrl}/api/sites`,
        site,
        { params: { key: config.secretKeys.sites } }
      )
    }
  }

  if (config.privateIngressManagerUrl) {
    const ingressInfos = getIngressInfos(portal)
    if (!forceSync.includes('ingress') && equal(ingressInfos, previousPortal && getIngressInfos(previousPortal))) {
      debugSyncPortal('nothing new to sync to ingress manager', ingressInfos)
    } else {
      debugSyncPortal('sync to ingress manager', ingressInfos)
      await axios.post(
          `${config.privateIngressManagerUrl}/api/ingress`,
          ingressInfos,
          { headers: { 'x-secret-key': config.secretKeys.ingress } }
      )
    }
  }
}

async function syncPortalDelete (portal: Portal, reqOrigin: string, cookie?: string) {
  const ownerId = portal.owner.department ? encodeURIComponent(`${portal.owner.id}:${portal.owner.department}`) : portal.owner.id
  await axios.delete(
    `${reqOrigin}/data-fair/api/v1/settings/${portal.owner.type}/${ownerId}/publication-sites/data-fair-portals/${portal._id}`,
    { headers: { cookie } }
  )

  await axios.delete(
    `${config.privateIngressManagerUrl}/api/ingress/${portal._id}`,
    { headers: { 'x-secret-key': config.secretKeys.ingress } }
  )

  // TODO: should we propagate deletion to SD or is it too risky ?
}

const cleanUnusedImages = async (portal: Portal) => {
  const imagesIds = []
  const imageRefs = [
    portal.config.logo,
    portal.config.logoDark,
    portal.config.favicon,
    portal.config.footer.logoPrimary,
    portal.config.footer.backgroundImage,
    portal.config.header.logoPrimary,
    portal.config.header.logoPrimaryMobile,
    portal.config.header.logoSecondary,
    portal.config.navBar.logo,
    portal.config.navBar.logoMobile,
    portal.config.datasets.card.thumbnail?.default,
    portal.draftConfig.logo,
    portal.draftConfig.logoDark,
    portal.draftConfig.favicon,
    portal.draftConfig.footer.logoPrimary,
    portal.draftConfig.footer.backgroundImage,
    portal.draftConfig.header.logoPrimary,
    portal.draftConfig.header.logoPrimaryMobile,
    portal.draftConfig.header.logoSecondary,
    portal.draftConfig.navBar.logo,
    portal.draftConfig.navBar.logoMobile,
    portal.draftConfig.datasets.card.thumbnail?.default
  ]
  // List of footer extra logos
  if (portal.config.footer.extraLogos) {
    for (const extraLogo of portal.config.footer.extraLogos) {
      imageRefs.push(extraLogo.logo)
    }
  }
  if (portal.draftConfig.footer.extraLogos) {
    for (const extraLogo of portal.draftConfig.footer.extraLogos) {
      imageRefs.push(extraLogo.logo)
    }
  }

  // List of topics images
  if (portal.config.topics) {
    for (const topic of portal.config.topics) {
      imageRefs.push(topic.thumbnail)
    }
  }
  if (portal.draftConfig.topics) {
    for (const topic of portal.draftConfig.topics) {
      imageRefs.push(topic.thumbnail)
    }
  }

  for (const imageRef of imageRefs) {
    if (!imageRef) continue
    imagesIds.push(imageRef._id)
    if (imageRef.mobileAlt) imagesIds.push(imageRef._id + '-mobile')
  }
  const deleteFilter = {
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    'resource.type': 'portal',
    'resource._id': portal._id,
    _id: { $nin: imagesIds }
  }
  await mongo.images.deleteMany(deleteFilter)
}
