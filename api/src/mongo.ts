import type { Portal } from '#types/portal/index.js'

import mongo from '@data-fair/lib-node/mongo.js'
import config from './config.ts'

export class PortalsMongo {
  get client () {
    return mongo.client
  }

  get db () {
    return mongo.db
  }

  get portals () {
    return mongo.db.collection<Portal>('portals')
  }

  init = async () => {
    await mongo.connect(config.mongoUrl)
    await mongo.configure({
      portals: {
        'main-keys': { 'owner.type': 1, 'owner.id': 1 }
      }
    })
  }
}

const portalsMongo = new PortalsMongo()

export default portalsMongo
