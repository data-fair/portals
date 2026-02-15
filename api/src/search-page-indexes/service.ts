/*
import es from '#es'
import mongo from '#mongo'
import { Portal } from '#types/portal/index.ts'

const indexName = (portalId: string) => `portal-search-${portalId}`

export const initPortalIndex = async (portal: Portal) => {
  // TODO
}

export const indexPortal = async (portal: Portal) => {
  const existingSearchPageIndexes: { _id: string }[] = await mongo.searchPageIndexes.find({ 'owner.type': portal.owner.type, 'owner.id': portal.owner.id, portal: portal._id }).project({ _id: 1 }).toArray()
}

export const deletePortalIndex = async (portal: Portal) => {
  await mongo.searchPageIndexes.deleteMany({ 'owner.type': portal.owner.type, 'owner.id': portal.owner.id, portal: portal._id })
  await es.client.indi
}
*/
