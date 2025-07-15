import type { Portal } from '#types/portal/index.js'
import mongo from '#mongo'
import debugModule from 'debug'

const debug = debugModule('portals')

export const createPortal = async (portal: Portal) => {
  debug('createPortal', portal)
  await mongo.portals.insertOne(portal)
}
