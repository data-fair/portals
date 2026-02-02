import type { Portal, PortalConfig } from '#types/portal/index.ts'
import type { ImageRef } from '#types/image-ref/index.ts'
import type { IngressManagerIngressInfo } from '#types'

import debugModule from 'debug'
import equal from 'fast-deep-equal'
import { type SessionStateAuthenticated, assertAccountRole, assertAdminMode, httpError } from '@data-fair/lib-express'
import axios from '@data-fair/lib-node/axios.js'
import eventsQueue from '@data-fair/lib-node/events-queue.js'
import { defaultTheme, fillTheme } from '@data-fair/lib-common-types/theme/index.js'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import mongo from '#mongo'
import config from '#config'
import { duplicateImage } from '../images/service.ts'
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
  renderPortalConfigMarkdown(portal.config)
  renderPortalConfigMarkdown(portal.draftConfig)
  await syncPortalUpdate(portal, null, reqOrigin, [], cookie)
  await mongo.portals.insertOne(portal)
}

export const patchPortal = async (portal: Portal, patch: Partial<Portal>, session: SessionStateAuthenticated, reqOrigin: string, forceSync: SyncPart[], cookie?: string) => {
  // Change WhiteLabel or isReference by super admin only
  if (patch.whiteLabel || patch.isReference) assertAdminMode(session)

  // Change of ownership - Check permissions and propagate to images
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
    updatedAt: new Date().toISOString()
  }
  if (fullPatch.draftConfig) {
    fullPatch.draftConfig.theme = fillTheme(fullPatch.draftConfig.theme, defaultTheme)
    renderPortalConfigMarkdown(fullPatch.draftConfig)
  }
  if (fullPatch.config) {
    renderPortalConfigMarkdown(fullPatch.config)
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
  sendPortalEvent(portal, 'a été validé', 'draft-validate', session, getChangesKeys(portal.config, updatedPortal.config))
  return updatedPortal
}

export const cancelPortalDraft = async (portal: Portal, session: SessionStateAuthenticated, reqOrigin: string, cookie?: string) => {
  debug('cancelPortalDraft', portal)
  const updatedPortal = await patchPortal(portal, { draftConfig: portal.config }, session, reqOrigin, [], cookie)
  await cleanUnusedImages(updatedPortal)
  sendPortalEvent(portal, 'a été annulé', 'draft-discard', session)
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
    datasetUrlTemplate: portal.ingress?.datasetUrlTemplate || (url + `/datasets/{${refType}}`),
    applicationUrlTemplate: portal.ingress?.applicationUrlTemplate || (url + `/applications/{${refType}}`)
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
    tmp: true,
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
    tmp: !portal.ingress,
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
    blockedIps: portal.ingress?.blockedIps,
    redirects: portal.ingress?.redirects,
    rewrites: portal.ingress?.rewrites,
  }]
  if (portal.ingress) {
    ingressInfos.push({
      url: portal.ingress.url,
      owner: portal.owner,
      _id: portal._id,
      controller: portal.ingress.controller,
      redirects: portal.ingress.redirects,
      rewrites: portal.ingress.rewrites,
      blockedIps: portal.ingress.blockedIps,
      customCert: portal.ingress.customerCert
    })
  } else {
    ingressInfos.push({
      url: config.portalUrlPattern.replace('{subdomain}', portal._id),
      owner: portal.owner,
      _id: portal._id
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
    ...getPortalConfigImageRefs(portal.config),
    ...getPortalConfigImageRefs(portal.draftConfig)
  ]

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

/**
 * Helper function to send events related to portals
 * @param portal The portal object
 * @param actionText The text describing the action (e.g. "a été validé")
 * @param topicAction The action part of the topic key (e.g. "draft-validate", "draft-discard")
 * @param sessionState Optional session state for authentication
 * @param body Optional additional information to include in the event
 */
export const sendPortalEvent = (
  portal: Portal,
  actionText: string,
  topicAction: string,
  sessionState?: SessionStateAuthenticated,
  body?: string
) => {
  if (!config.privateEventsUrl && !config.secretKeys.events) return

  const title = topicAction.includes('draft-')
    ? `Le brouillon du portail ${portal.title} ${actionText}`
    : `Le portail ${portal.title} ${actionText}`

  eventsQueue.pushEvent({
    title,
    topic: { key: `portals:portal-${topicAction}:${portal._id}` },
    sender: portal.owner,
    resource: {
      type: 'portal',
      id: portal._id,
      title: portal.title,
    },
    body
  }, sessionState)
}

const getChangesKeys = (obj1: Record<string, any>, obj2: Record<string, any>): string => {
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])
  const modifiedKeys: string[] = []

  for (const key of allKeys) {
    if (!equal(obj1[key], obj2[key])) modifiedKeys.push(key)
  }

  return 'Modifications : ' + modifiedKeys.join(', ')
}

/**
 * Duplicate the configuration from an existing portal.
 * Returns the duplicated config and an event details message.
 * The caller decides merge order with its own defaults and overrides.
 */
export const duplicatePortalConfig = async (
  sessionState: SessionStateAuthenticated,
  sourcePortalId: string,
  newPortalId: string,
  newOwner: Portal['owner']
): Promise<{ config: PortalConfig; eventDetails: string }> => {
  const sourcePortal = await mongo.portals.findOne({ _id: sourcePortalId })
  if (!sourcePortal) throw httpError(404, `portal "${sourcePortalId}" not found for duplication`)

  if (!sourcePortal.isReference) assertAccountRole(sessionState, sourcePortal.owner, 'admin')

  const duplicatedConfig = JSON.parse(JSON.stringify(sourcePortal.config)) as PortalConfig

  const imageIdMap = new Map<string, string>()
  const imageRefs = getPortalConfigImageRefs(duplicatedConfig).filter((ref): ref is ImageRef => Boolean(ref))

  await Promise.all(
    imageRefs.map(async (imageRef) => {
      if (!imageIdMap.has(imageRef._id)) {
        const newImageId = await duplicateImage(imageRef._id, 'portal', newPortalId, newOwner)
        imageIdMap.set(imageRef._id, newImageId)
      }
    })
  )

  const rewrite = (imageRef?: ImageRef) => {
    if (imageRef && imageIdMap.has(imageRef._id)) {
      imageRef._id = imageIdMap.get(imageRef._id)!
    }
  }

  rewrite(duplicatedConfig.logo)
  rewrite(duplicatedConfig.logoDark)
  rewrite(duplicatedConfig.favicon)
  rewrite(duplicatedConfig.errorImages?.notFound)
  rewrite(duplicatedConfig.errorImages?.forbidden)
  rewrite(duplicatedConfig.errorImages?.fallback)
  rewrite(duplicatedConfig.footer.logoPrimary)
  rewrite(duplicatedConfig.footer.backgroundImage)
  rewrite(duplicatedConfig.header.logoPrimary)
  rewrite(duplicatedConfig.header.logoPrimaryMobile)
  rewrite(duplicatedConfig.header.logoSecondary)
  rewrite(duplicatedConfig.navBar.logo)
  rewrite(duplicatedConfig.navBar.logoMobile)
  rewrite(duplicatedConfig.datasets.card.thumbnail?.default)
  if (duplicatedConfig.footer.extraLogos) {
    for (const extraLogo of duplicatedConfig.footer.extraLogos) rewrite(extraLogo.logo)
  }
  if (duplicatedConfig.topics) {
    for (const topic of duplicatedConfig.topics) rewrite(topic.thumbnail)
  }

  let eventDetails = `Dupliqué depuis le portail "${sourcePortal.title}" (${sourcePortalId})`
  if (sourcePortal?.isReference) eventDetails = `Dupliqué depuis le portail de référence "${sourcePortal.title}" (${sourcePortalId})`

  return { config: duplicatedConfig, eventDetails }
}

/**
 * Collect image references from a portal config.
 */
const getPortalConfigImageRefs = (portalConfig: PortalConfig) => {
  const imageRefs = [
    portalConfig.logo,
    portalConfig.logoDark,
    portalConfig.favicon,
    portalConfig.errorImages?.notFound,
    portalConfig.errorImages?.forbidden,
    portalConfig.errorImages?.fallback,
    portalConfig.footer.logoPrimary,
    portalConfig.footer.backgroundImage,
    portalConfig.header.logoPrimary,
    portalConfig.header.logoPrimaryMobile,
    portalConfig.header.logoSecondary,
    portalConfig.navBar.logo,
    portalConfig.navBar.logoMobile,
    portalConfig.datasets.card.thumbnail?.default,
  ]
  // List of footer extra logos
  if (portalConfig.footer.extraLogos) {
    for (const extraLogo of portalConfig.footer.extraLogos) {
      imageRefs.push(extraLogo.logo)
    }
  }

  // List of topics images
  if (portalConfig.topics) {
    for (const topic of portalConfig.topics) {
      imageRefs.push(topic.thumbnail)
    }
  }

  return imageRefs
}

/**
 * Render markdown fields in portal config to HTML
 */
const renderPortalConfigMarkdown = (portalConfig: PortalConfig) => {
  if (portalConfig.contactInformations?.infos) {
    portalConfig.contactInformations.infos_html = renderMarkdown(portalConfig.contactInformations.infos)
  }
}
