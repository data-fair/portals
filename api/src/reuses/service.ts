import type { Reuse } from '#types/reuse/index.ts'

import debugModule from 'debug'
import { type SessionStateAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import mongo from '#mongo'

const debug = debugModule('reuses')

export const getReuseAsAdmin = async (sessionState: SessionStateAuthenticated, id: string) => {
  const reuse = await mongo.reuses.findOne({ _id: id })
  if (!reuse) throw httpError(404, `reuse "${id}" not found`)
  assertAccountRole(sessionState, reuse.owner, 'admin')
  return reuse
}

export const createReuse = async (reuse: Reuse) => {
  debug('createReuse', reuse)
  if (reuse.config.description) {
    reuse.config._descriptionHtml = renderMarkdown(reuse.config.description)
  }
  await mongo.reuses.insertOne(reuse)
}

export const patchReuse = async (reuse: Reuse, patch: Partial<Reuse>, session: SessionStateAuthenticated) => {
  // Render markdown description if provided
  if (patch.config?.description) patch.config._descriptionHtml = renderMarkdown(patch.config.description)

  // Sync title
  if (patch.config?.title) patch.title = patch.config.title

  if (patch.owner) {
    assertAccountRole(session, patch.owner, 'admin')
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
    updated: { id: session.user.id, name: session.user.name, date: new Date().toISOString() }
  }
  const updatedReuse = { ...reuse, ...fullPatch }

  await mongo.reuses.updateOne({ _id: reuse._id }, { $set: fullPatch })
  await cleanUnusedImages(updatedReuse)
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
  const imageRef = reuse.config.image
  if (imageRef) {
    imagesIds.push(imageRef._id)
    if (imageRef.mobileAlt) imagesIds.push(imageRef._id + '-mobile')
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
