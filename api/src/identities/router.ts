// Define a few routes to be used to synchronize data with the users/organizations directory
// Useful both for functionalities and help respect GDPR rules

import config from '#config'
import { createIdentitiesRouter } from '@data-fair/lib-express/identities/index.js'
import mongo from '#mongo'

export default createIdentitiesRouter(
  config.secretKeys.identities,
  // onUpdate
  async (identity) => {
    await mongo.portals.updateMany({ 'owner.type': identity.type, 'owner.id': identity.id }, { $set: { 'owner.name': identity.name } })
    if (identity.departments) {
      for (const department of identity.departments.filter(d => !!d.name)) {
        await mongo.portals.updateMany({ 'owner.type': identity.type, 'owner.id': identity.id, 'owner.department': department.id }, { $set: { 'owner.name': identity.name, 'owner.departmentName': department.name } })
      }
    }
  },
  // onDelete
  async (identity) => {
    await mongo.portals.deleteMany({ 'owner.type': identity.type, 'owner.id': identity.id })
  }
)
