import type { Group } from '#types/group/index.js'
import type { SessionStateAuthenticated } from '@data-fair/lib-express'
import Debug from 'debug'
import mongo from '#mongo'

const debug = Debug('groups')

/**
 * Check that a group object is valid
 */
export const validateGroup = async (group: Partial<Group>) => {
  return (await import('#types/group/index.ts')).returnValid(group)
}

export const createGroup = async (group: Group) => {
  await validateGroup(group)
  debug('createGroup', group)
  await mongo.groups.insertOne(group)
}

export const patchGroup = async (group: Group, patch: Partial<Group>, session: SessionStateAuthenticated) => {
  const fullPatch = {
    ...patch,
    updated: { id: session.user.id, name: session.user.name, date: new Date().toISOString() }
  }
  const updatedGroup = { ...group, ...fullPatch }
  await validateGroup(updatedGroup)
  await mongo.groups.updateOne({ _id: group._id }, { $set: fullPatch })
  return updatedGroup
}
