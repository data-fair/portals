import type { Reuse } from '#types/reuse/index.ts'
import type { Portal } from '#types/portal/index.ts'

import debugModule from 'debug'
import { type SessionStateAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express'
import eventsQueue from '@data-fair/lib-node/events-queue.js'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import mongo from '#mongo'
import config from '#config'

const debug = debugModule('reuses')

export const getReuseAsAdmin = async (sessionState: SessionStateAuthenticated, id: string) => {
  const reuse = await mongo.reuses.findOne({ _id: id })
  if (!reuse) throw httpError(404, `reuse "${id}" not found`)
  assertAccountRole(sessionState, reuse.owner, 'admin')
  return reuse
}

// Allow access if user is owner (admin) or submitter
export const getReuseAsAdminOrSubmitter = async (sessionState: SessionStateAuthenticated, id: string) => {
  const reuse = await mongo.reuses.findOne({ _id: id })
  if (!reuse) throw httpError(404, `reuse "${id}" not found`)

  const isOwner = reuse.owner.type === sessionState.account.type && reuse.owner.id === sessionState.account.id
  const isSubmitter = reuse.submitter?.type === sessionState.account.type && reuse.submitter?.id === sessionState.account.id

  if (isOwner) assertAccountRole(sessionState, reuse.owner, 'admin')
  else if (isSubmitter) assertAccountRole(sessionState, reuse.submitter!, 'admin')

  return reuse
}

export const createReuse = async (reuse: Reuse) => {
  debug('createReuse', reuse)
  if (reuse.config.description) {
    reuse.config._descriptionHtml = renderMarkdown(reuse.config.description)
  }
  await mongo.reuses.insertOne(reuse)
}

export const patchReuse = async (
  reuse: Reuse,
  patch: Partial<Reuse>,
  session: SessionStateAuthenticated,
  options?: { skipOwnerRoleCheck?: boolean }
) => {
  // Render markdown description if provided in config
  if (patch.config?.description) patch.config._descriptionHtml = renderMarkdown(patch.config.description)
  if (patch.draftConfig?.description) patch.draftConfig._descriptionHtml = renderMarkdown(patch.draftConfig.description)

  if (patch.config?.title) patch.title = patch.config.title // Sync title from config

  if (patch.owner) {
    if (!options?.skipOwnerRoleCheck) assertAccountRole(session, patch.owner, 'admin')
    await mongo.images.updateMany(
      {
        'owner.type': reuse.owner.type,
        'owner.id': reuse.owner.id,
        'resource.type': 'reuse',
        'resource._id': reuse._id
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
  const updatedReuse = { ...reuse, ...fullPatch }

  // Track portal additions/removals
  const addedPortals = patch.portals ? patch.portals.filter(portalId => !reuse.portals.includes(portalId)) : []
  const removedPortals = patch.portals ? reuse.portals.filter(portalId => !patch.portals!.includes(portalId)) : []

  await mongo.reuses.updateOne({ _id: reuse._id }, { $set: fullPatch })
  await cleanUnusedImages(updatedReuse)

  // Send events for portal publication changes
  for (const portalId of addedPortals) {
    sendReuseEvent(updatedReuse, 'a été publiée sur un portail', 'publish', session, `La réutilisation a été publiée sur le portail : ${portalId}`)
  }

  for (const portalId of removedPortals) {
    sendReuseEvent(updatedReuse, "a été dépubliée d'un portail", 'unpublish', session, `La réutilisation a été dépubliée du portail : ${portalId}`)
  }

  return updatedReuse
}

export const deleteReuse = async (reuse: Reuse) => {
  await mongo.images.deleteMany({
    'owner.type': reuse.owner.type,
    'owner.id': reuse.owner.id,
    'resource.type': 'reuse',
    'resource._id': reuse._id
  })
  await mongo.reuses.deleteOne({ _id: reuse._id })
}

const cleanUnusedImages = async (reuse: Reuse) => {
  const imagesIds: string[] = []

  // Add images from config
  const configImageRef = reuse.config.image
  if (configImageRef) {
    imagesIds.push(configImageRef._id)
    if (configImageRef.mobileAlt) imagesIds.push(configImageRef._id + '-mobile')
  }

  // Add images from draftConfig
  const draftImageRef = reuse.draftConfig?.image
  if (draftImageRef) {
    imagesIds.push(draftImageRef._id)
    if (draftImageRef.mobileAlt) imagesIds.push(draftImageRef._id + '-mobile')
  }

  const deleteFilter = {
    'owner.type': reuse.owner.type,
    'owner.id': reuse.owner.id,
    'resource.type': 'reuse',
    'resource._id': reuse._id,
    _id: { $nin: imagesIds }
  }
  await mongo.images.deleteMany(deleteFilter)
}

/**
 * Helper function to send events related to reuses
 * @param reuse The reuse object
 * @param actionText The text describing the action (e.g. "a été créé")
 * @param topicAction The action part of the topic key (e.g. "create", "patch", "delete")
 * @param sessionState Optional session state for authentication
 * @param body Optional additional information to include in the event
 */
export const sendReuseEvent = (
  reuse: Reuse,
  actionText: string,
  topicAction: string,
  sessionState?: SessionStateAuthenticated,
  body?: string
) => {
  if (!config.privateEventsUrl && !config.secretKeys.events) return

  const title = `La réutilisation ${reuse.title} ${actionText}`

  eventsQueue.pushEvent({
    title,
    topic: { key: `reuses:reuse-${topicAction}:${reuse._id}` },
    sender: reuse.owner,
    resource: {
      type: 'reuse',
      id: reuse._id,
      title: reuse.title,
    },
    body
  }, sessionState)
}

export const validateReuseDraft = async (reuse: Reuse, session: SessionStateAuthenticated) => {
  debug('validateReuseDraft', reuse)
  const updatedReuse = await patchReuse(reuse, { config: reuse.draftConfig, title: reuse.draftConfig.title }, session)
  await cleanUnusedImages(updatedReuse)
  sendReuseEvent(reuse, 'a été validé', 'draft-validate', session)
  return updatedReuse
}

export const cancelReuseDraft = async (reuse: Reuse, session: SessionStateAuthenticated) => {
  debug('cancelReuseDraft', reuse)
  const updatedReuse = await patchReuse(reuse, { draftConfig: reuse.config }, session)
  await cleanUnusedImages(updatedReuse)
  sendReuseEvent(reuse, 'a été annulé', 'draft-discard', session)
  return updatedReuse
}

export const submitReuse = async (reuse: Reuse, portalId: string, session: SessionStateAuthenticated) => {
  debug('submitReuse', reuse, portalId)

  // Get portal configuration
  const portal = await mongo.portals.findOne({ _id: portalId }) as Portal | null
  if (!portal) throw httpError(404, `portal "${portalId}" not found`)

  // Check if reuse submission is allowed on this portal
  if (!portal.config.reuses?.allowUserReuses) throw httpError(403, 'Reuse submission is not allowed on this portal')

  // Validate draft before submitting
  await validateReuseDraft(reuse, session)

  // Create submitter object (previous owner + portalId)
  const submitter = {
    type: reuse.owner.type,
    id: reuse.owner.id,
    name: reuse.owner.name,
    portalId
  }

  // Update reuse with new owner, submitter, and add to requestedPortals
  const updatedReuse = await patchReuse(reuse, {
    owner: portal.owner,
    submitter,
    requestedPortals: [...new Set([...reuse.requestedPortals, portalId])]
  }, session, { skipOwnerRoleCheck: true })

  sendReuseEvent(updatedReuse, 'a été soumise pour validation', 'submit', session, `Soumise sur le portail : ${portalId}`)

  return updatedReuse
}
