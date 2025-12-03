import type { Use } from '#types/use/index.ts'

import debugModule from 'debug'
import { type SessionStateAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import mongo from '#mongo'

const debug = debugModule('uses')

export const getUseAsAdmin = async (sessionState: SessionStateAuthenticated, id: string) => {
  const use = await mongo.uses.findOne({ _id: id })
  if (!use) throw httpError(404, `use "${id}" not found`)
  assertAccountRole(sessionState, use.owner, 'admin')
  return use
}

export const createUse = async (use: Use) => {
  debug('createUse', use)
  if (use.config.description) {
    use.config._descriptionHtml = renderMarkdown(use.config.description)
  }
  await mongo.uses.insertOne(use)
}

export const patchUse = async (use: Use, patch: Partial<Use>, session: SessionStateAuthenticated) => {
  // Render markdown description if provided
  if (patch.config?.description) {
    patch.config._descriptionHtml = renderMarkdown(patch.config.description)
  }

  // Sync title from config if config.title is changed and current title matches current config.title
  if (patch.config?.title && use.title === use.config.title) {
    patch.title = patch.config.title
  }

  if (patch.owner) {
    assertAccountRole(session, use.owner, 'admin')
    assertAccountRole(session, patch.owner, 'admin')
    await mongo.images.updateMany(
      {
        'owner.type': use.owner.type,
        'owner.id': use.owner.id,
        'resource.type': 'use',
        'resource._id': use._id
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
  const updatedUse = { ...use, ...fullPatch }

  await mongo.uses.updateOne({ _id: use._id }, { $set: fullPatch })

  await cleanUnusedImages(updatedUse)

  return updatedUse
}

export const deleteUse = async (use: Use) => {
  await mongo.images.deleteMany({
    'owner.type': use.owner.type,
    'owner.id': use.owner.id,
    'resource.type': 'use',
    'resource._id': use._id
  })
  await mongo.uses.deleteOne({ _id: use._id })
}

const cleanUnusedImages = async (use: Use) => {
  const imagesIds: string[] = []
  const imageRef = use.config.image
  if (imageRef) {
    imagesIds.push(imageRef._id)
    if (imageRef.mobileAlt) imagesIds.push(imageRef._id + '-mobile')
  }
  const deleteFilter = {
    'owner.type': use.owner.type,
    'owner.id': use.owner.id,
    'resource.type': 'use',
    'resource._id': use._id,
    _id: { $nin: imagesIds }
  }
  await mongo.images.deleteMany(deleteFilter)
}
