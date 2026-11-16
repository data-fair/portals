import type { Reuse } from '#types/reuse/index.ts'
import type { Portal } from '#types/portal/index.ts'
import debugModule from 'debug'
import slug from 'slugify'
import { type SessionStateAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express'
import eventsQueue, { type PushEvent } from '@data-fair/lib-node/events-queue.js'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import mongo from '#mongo'
import { assertOwnerPortals } from '../portals/service.ts'
import { transferResourceImages } from '../images/service.ts'

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
  await assertOwnerPortals(reuse.owner, reuse.portals)
  if (reuse.config.description) {
    reuse.config._descriptionHtml = renderMarkdown(reuse.config.description)
  }
  await mongo.reuses.insertOne(reuse)
}

export const patchReuse = async (
  reuse: Reuse,
  patch: Partial<Reuse>,
  session: SessionStateAuthenticated,
  options?: { skipOwnerRoleCheck?: boolean; forceNewSlug?: boolean }
) => {
  // only the added ones: a transferred reuse may keep the ids of its former owner's portals
  if (patch.portals) await assertOwnerPortals(patch.owner ?? reuse.owner, patch.portals.filter(portalId => !reuse.portals.includes(portalId)))
  // Render markdown description if provided in config
  if (patch.config?.description) patch.config._descriptionHtml = renderMarkdown(patch.config.description)
  if (patch.draftConfig?.description) patch.draftConfig._descriptionHtml = renderMarkdown(patch.draftConfig.description)

  if (patch.config?.title) patch.title = patch.config.title // Sync title from config

  if (patch.owner) {
    if (!options?.skipOwnerRoleCheck) assertAccountRole(session, patch.owner, 'admin')

    // Generate new slug or check uniqueness for new owner
    const ownerQuery = {
      'owner.type': patch.owner.type,
      'owner.id': patch.owner.id,
      _id: { $ne: reuse._id }
    }
    const isSlugTaken = !options?.forceNewSlug
      ? await mongo.reuses.findOne({ ...ownerQuery, slug: reuse.slug })
      : false

    if (options?.forceNewSlug || isSlugTaken) {
      const baseSlug = slug.default(reuse.config.title, { lower: true, strict: true })
      let uniqueSlug = baseSlug
      let counter = 1

      while (await mongo.reuses.findOne({ ...ownerQuery, slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter++}`
      }

      patch.slug = uniqueSlug
    }

    // Update ownership of associated images
    await transferResourceImages({ type: 'reuse', _id: reuse._id }, reuse.owner, patch.owner)
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
    sendReuseEvent(updatedReuse, 'publish', session, {
      en: `The reuse was published on the portal: ${portalId}`,
      fr: `La réutilisation a été publiée sur le portail : ${portalId}`
    })
  }

  for (const portalId of removedPortals) {
    sendReuseEvent(updatedReuse, 'unpublish', session, {
      en: `The reuse was unpublished from the portal: ${portalId}`,
      fr: `La réutilisation a été dépubliée du portail : ${portalId}`
    })
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

const reuseTitles = {
  create: (title: string) => ({ en: `The reuse ${title} was created`, fr: `La réutilisation ${title} a été créée` }),
  patch: (title: string) => ({ en: `The reuse ${title} was updated`, fr: `La réutilisation ${title} a été modifiée` }),
  delete: (title: string) => ({ en: `The reuse ${title} was deleted`, fr: `La réutilisation ${title} a été supprimée` }),
  publish: (title: string) => ({ en: `The reuse ${title} was published on a portal`, fr: `La réutilisation ${title} a été publiée sur un portail` }),
  unpublish: (title: string) => ({ en: `The reuse ${title} was unpublished from a portal`, fr: `La réutilisation ${title} a été dépubliée d'un portail` }),
  submit: (title: string) => ({ en: `The reuse ${title} was submitted for validation`, fr: `La réutilisation ${title} a été soumise pour validation` }),
  'draft-validate': (title: string) => ({ en: `The draft of the reuse ${title} was validated`, fr: `Le brouillon de la réutilisation ${title} a été validé` }),
  'draft-discard': (title: string) => ({ en: `The draft of the reuse ${title} was discarded`, fr: `Le brouillon de la réutilisation ${title} a été annulé` })
}

/**
 * Send an event about a reuse.
 * @param topicAction The action part of the topic key, it also selects the event title
 * @param body Details of the event
 */
export const sendReuseEvent = (
  reuse: Reuse,
  topicAction: keyof typeof reuseTitles,
  sessionState?: SessionStateAuthenticated,
  body?: PushEvent['body']
) => {
  eventsQueue.pushEvent({
    title: reuseTitles[topicAction](reuse.title),
    topic: { key: `reuses:reuse-${topicAction}:${reuse._id}` },
    sender: reuse.owner,
    resource: {
      type: 'reuse',
      id: reuse._id,
      title: reuse.title,
    },
    urlParams: { reuseId: reuse._id },
    body
  }, sessionState)
}

export const validateReuseDraft = async (reuse: Reuse, session: SessionStateAuthenticated) => {
  debug('validateReuseDraft', reuse)
  const updatedReuse = await patchReuse(reuse, { config: reuse.draftConfig, title: reuse.draftConfig.title }, session)
  await cleanUnusedImages(updatedReuse)
  sendReuseEvent(reuse, 'draft-validate', session)
  return updatedReuse
}

export const cancelReuseDraft = async (reuse: Reuse, session: SessionStateAuthenticated) => {
  debug('cancelReuseDraft', reuse)
  const updatedReuse = await patchReuse(reuse, { draftConfig: reuse.config }, session)
  await cleanUnusedImages(updatedReuse)
  sendReuseEvent(reuse, 'draft-discard', session)
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
  const validatedReuse = await validateReuseDraft(reuse, session)

  // Create submitter object (previous owner + portalId)
  const submitter = {
    type: validatedReuse.owner.type,
    id: validatedReuse.owner.id,
    name: validatedReuse.owner.name,
    portalId
  }

  // Update reuse with new owner, submitter, and add to requestedPortals
  const updatedReuse = await patchReuse(validatedReuse, {
    owner: portal.owner,
    submitter,
    requestedPortals: [...new Set([...validatedReuse.requestedPortals, portalId])]
  }, session, { skipOwnerRoleCheck: true, forceNewSlug: true })

  const portalTitle = portal.title || portal.config?.title || portal._id
  const portalUrlOrId = portal.ingress?.url || portal._id
  sendReuseEvent(updatedReuse, 'submit', session, {
    en: `Submitted on the portal: ${portalTitle} (${portalUrlOrId})`,
    fr: `Soumise sur le portail : ${portalTitle} (${portalUrlOrId})`
  })

  return updatedReuse
}
