import type { Group } from '#types/group/index.ts'
import type { SessionStateAuthenticated } from '@data-fair/lib-express'
import Debug from 'debug'
import eventsQueue from '@data-fair/lib-node/events-queue.js'
import mongo from '#mongo'
import config from '#config'

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
    updatedAt: new Date().toISOString()
  }
  const updatedGroup = { ...group, ...fullPatch }
  await validateGroup(updatedGroup)
  await mongo.groups.updateOne({ _id: group._id }, { $set: fullPatch })
  // Update group title in pages
  if (fullPatch.title && fullPatch.title !== group.title) {
    await Promise.all([
      mongo.pages.updateMany(
        { 'config.genericMetadata.group._id': group._id },
        { $set: { 'config.genericMetadata.group.title': fullPatch.title } }
      ),
      mongo.pages.updateMany(
        { 'draftConfig.genericMetadata.group._id': group._id },
        { $set: { 'draftConfig.genericMetadata.group.title': fullPatch.title } }
      )
    ])
  }
  return updatedGroup
}

/**
 * Helper function to send events related to groups
 * @param group The group object
 * @param actionText The text describing the action (e.g. "a été créé")
 * @param topicAction The action part of the topic key (e.g. "create", "patch", "delete")
 * @param sessionState Optional session state for authentication
 * @param body Optional additional information to include in the event
 */
export const sendGroupEvent = (
  group: Group,
  actionText: string,
  topicAction: string,
  sessionState?: SessionStateAuthenticated,
  body?: string
) => {
  if (!config.privateEventsUrl && !config.secretKeys.events) return

  const title = `Le groupe de pages ${group.title} ${actionText}`

  eventsQueue.pushEvent({
    title,
    topic: { key: `groups:group-${topicAction}:${group._id}` },
    sender: group.owner,
    resource: {
      type: 'group',
      id: group._id,
      title: group.title,
    },
    body
  }, sessionState)
}
