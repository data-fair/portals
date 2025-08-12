import type { Portal } from '#types/portal/index.js'
import mongo from '#mongo'
import config from '#config'
import debugModule from 'debug'
import { type SessionStateAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express'
import axios from '@data-fair/lib-node/axios.js'
import equal from 'fast-deep-equal'
import { type IngressManagerIngressInfo } from '#types'

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
  await syncPortalUpdate(portal, null, reqOrigin, cookie)
  await mongo.portals.insertOne(portal)
}

export const deletePortal = async (portal: Portal, reqOrigin: string, cookie?: string) => {
  debug('createPortal', portal)
  await syncPortalDelete(portal, reqOrigin, cookie)
  await mongo.portals.deleteOne({ _id: portal._id })
}

export const patchPortal = async (portal: Portal, patch: Partial<Portal>, session: SessionStateAuthenticated, reqOrigin: string, cookie?: string) => {
  const fullPatch = {
    ...patch,
    updated: { id: session.user.id, name: session.user.name, date: new Date().toISOString() }
  }
  const updatedPortal = { ...portal, ...fullPatch }
  // we propagate before storing as it has a greater probability of failing and we prefer a cohesive state
  await syncPortalUpdate(updatedPortal, portal, reqOrigin, cookie)
  await mongo.portals.updateOne({ _id: portal._id }, { $set: fullPatch })
  return updatedPortal
}

export const validatePortalDraft = async (portal: Portal, session: SessionStateAuthenticated, reqOrigin: string, cookie?: string) => {
  debug('validatePortalDraft', portal)
  return patchPortal(portal, { config: portal.draftConfig }, session, reqOrigin, cookie)
}

export const cancelPortalDraft = async (portal: Portal, session: SessionStateAuthenticated, reqOrigin: string, cookie?: string) => {
  debug('cancelPortalDraft', portal)
  return patchPortal(portal, { draftConfig: portal.config }, session, reqOrigin, cookie)
}

const getPublicationSite = (portal: Portal) => {
  const refType = portal.ingress ? 'slug' : 'id'
  const draftUrl = config.draftUrlPattern.replace('{id}', portal._id)
  const url = portal.ingress ? portal.ingress.url : draftUrl
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

const getSDSites = (portal: Portal) => {
  const sites = [{
    _id: 'data-fair-portals:draft-' + portal._id,
    owner: portal.owner,
    host: new URL(config.draftUrlPattern.replace('{id}', portal._id)).host,
    // logo: `https://${portal.host}/api/v1/portals/${portal._id}/assets/logo`,
    // theme: {
    //   primaryColor: portal.config.themeColor || '#1976D2'
    // }
  }]
  if (portal.ingress) {
    sites.push({
      _id: 'data-fair-portals:' + portal._id,
      owner: portal.owner,
      host: new URL(portal.ingress.url).host
    })
  }
  return sites
}

const getIngressInfos = (portal: Portal) => {
  const ingressInfos: IngressManagerIngressInfo[] = [{
    url: config.draftUrlPattern.replace('{id}', portal._id),
    owner: portal.owner,
    _id: 'data-fair-portals:draft-' + portal._id,
  }]
  if (portal.ingress) {
    ingressInfos.push({
      url: portal.ingress.url,
      owner: portal.owner,
      _id: 'data-fair-portals:draft-' + portal._id,
    })
  }
  return ingressInfos
}

// portals are synced to settings.publicationSites in data-fair and to a dataset containing images
async function syncPortalUpdate (portal: Portal, previousPortal: Portal | null, reqOrigin: string, cookie?: string) {
  debugSyncPortal('sync portal update', portal)

  const publicationSite = getPublicationSite(portal)
  if (equal(publicationSite, previousPortal && getPublicationSite(previousPortal))) {
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

  const sdSites = getSDSites(portal)
  if (equal(sdSites, previousPortal && getSDSites(previousPortal))) {
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
    if (equal(ingressInfos, previousPortal && getIngressInfos(previousPortal))) {
      debugSyncPortal('nothing new to sync to ingress manager', ingressInfos)
    } else {
      for (const ingressInfo of ingressInfos) {
        debugSyncPortal('sync to ingress manager', ingressInfo)
        await axios.post(
          `${config.privateIngressManagerUrl}/api/ingress`,
          ingressInfo,
          { params: { key: config.secretKeys.ingress } }
        )
      }
    }
  }
}

async function syncPortalDelete (portal: Portal, reqOrigin: string, cookie?: string) {
  const ownerId = portal.owner.department ? encodeURIComponent(`${portal.owner.id}:${portal.owner.department}`) : portal.owner.id
  await axios.delete(
    `${reqOrigin}/data-fair/api/v1/settings/${portal.owner.type}/${ownerId}/publication-sites/data-fair-portals/${portal._id}`,
    { headers: { cookie } }
  )

  // TODO: should we propagate deletion to SD and ingress manager or is it too risky ?
}
