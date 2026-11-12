import type { Group } from '#types/group/index.ts'
import type { SessionStateAuthenticated } from '@data-fair/lib-express'
import Debug from 'debug'
import eventsQueue from '@data-fair/lib-node/events-queue.js'
import mongo from '#mongo'
import { type EventAction, type EventText, eventText } from '../utils/event-texts.ts'

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
  // Update group root page in pages
  if ('rootPage' in fullPatch && fullPatch.rootPage !== group.rootPage) {
    await Promise.all([
      mongo.pages.updateMany(
        { 'config.genericMetadata.group._id': group._id },
        { $set: { 'config.genericMetadata.group.rootPage': fullPatch.rootPage ?? '' } }
      ),
      mongo.pages.updateMany(
        { 'draftConfig.genericMetadata.group._id': group._id },
        { $set: { 'draftConfig.genericMetadata.group.rootPage': fullPatch.rootPage ?? '' } }
      )
    ])
  }
  return updatedGroup
}

/**
 * Helper function to send events related to groups
 * @param topicAction The action part of the topic key, it also selects the event title (e.g. "create", "draft-validate")
 * @param body Optional additional information to include in the event
 */
export const sendGroupEvent = (
  group: Group,
  topicAction: EventAction<'group'>,
  sessionState?: SessionStateAuthenticated,
  body?: EventText
) => {
  eventsQueue.pushEvent({
    title: eventText(`group-${topicAction}`, { title: group.title }),
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
