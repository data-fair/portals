// Keep the copies of identity data (owners of portals, pages, reuses, groups, images, fonts)
// in sync with the users/organizations directory, and remove them when an identity is deleted.

import type { IdentityUpdate, IdentityDelete } from '@data-fair/lib-express/identities/index.js'
import { internalError } from '@data-fair/lib-node/observer.js'
import mongo from '#mongo'
import { deletePortalSites } from '../portals/service.ts'

const ownedCollections = () => [mongo.portals, mongo.pages, mongo.reuses, mongo.groups, mongo.images, mongo.fontAssets]

export const updateIdentity = async (identity: IdentityUpdate) => {
  const { type, id, name, departments } = identity
  for (const collection of ownedCollections()) {
    await collection.updateMany({ 'owner.type': type, 'owner.id': id }, { $set: { 'owner.name': name } })
    for (const department of departments?.filter(d => !!d.name) ?? []) {
      await collection.updateMany(
        { 'owner.type': type, 'owner.id': id, 'owner.department': department.id },
        { $set: { 'owner.departmentName': department.name } }
      )
    }
    // the directory sends the complete list of departments: a department missing from it was
    // deleted, its resources keep the id (still reachable by the organization admins) but not the name
    if (departments) {
      await collection.updateMany(
        { 'owner.type': type, 'owner.id': id, 'owner.department': { $exists: true, $nin: departments.map(d => d.id) } },
        { $unset: { 'owner.departmentName': 1 } }
      )
    }
  }
}

export const deleteIdentity = async (identity: IdentityDelete) => {
  const { type, id } = identity
  // the sites and ingresses of the portals live in other services, release them like DELETE /portals/:id does
  // (the publication site in data-fair is removed by its own identity webhook)
  for await (const portal of mongo.portals.find({ 'owner.type': type, 'owner.id': id })) {
    try {
      await deletePortalSites(portal)
    } catch (err) {
      internalError('identities-portal-sites', err)
    }
  }
  for (const collection of ownedCollections()) {
    await collection.deleteMany({ 'owner.type': type, 'owner.id': id })
  }
}
