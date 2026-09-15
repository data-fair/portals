// Define a few routes to be used to synchronize data with the users/organizations directory
// Useful both for functionalities and help respect GDPR rules

import config from '#config'
import { createIdentitiesRouter } from '@data-fair/lib-express/identities/index.js'
import { updateIdentity, deleteIdentity } from './service.ts'

export default createIdentitiesRouter(config.secretKeys.identities, updateIdentity, deleteIdentity)
