import type { Portal } from '#types/portal/index.js'
import mongo from '#mongo'
import debugModule from 'debug'
import { type SessionStateAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express'

const debug = debugModule('portals')

export const getPortalAsAdmin = async (sessionState: SessionStateAuthenticated, id: string) => {
  const portal = await mongo.portals.findOne({ _id: id })
  if (!portal) throw httpError(404, `portal "${id}" not found`)
  assertAccountRole(sessionState, portal.owner, 'admin')
  return portal
}

export const createPortal = async (portal: Portal) => {
  debug('createPortal', portal)
  await mongo.portals.insertOne(portal)
}

export const patchPortal = async (portal: Portal, patch: Partial<Portal>, session: SessionStateAuthenticated) => {
  await mongo.portals.updateOne({ _id: portal._id }, {
    $set: {
      ...patch,
      updated: { id: session.user.id, name: session.user.name, date: new Date().toISOString() }
    }
  })
}

export const validatePortalDraft = async (portal: Portal) => {
  debug('validatePortalDraft', portal)
  await mongo.portals.updateOne({ _id: portal._id }, { $set: { config: portal.draftConfig } })
}

export const cancelPortalDraft = async (portal: Portal) => {
  debug('cancelPortalDraft', portal)
  await mongo.portals.updateOne({ _id: portal._id }, { $set: { draftConfig: portal.config } })
}
