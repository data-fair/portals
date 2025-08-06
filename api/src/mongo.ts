import type { Portal } from '#types/portal/index.js'
import type { Page } from '#types/page/index.js'

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

  get pages () {
    return mongo.db.collection<Page>('pages')
  }

  init = async () => {
    await mongo.connect(config.mongoUrl)
    await mongo.configure({
      portals: {
        'main-keys': { 'owner.type': 1, 'owner.id': 1 }
      },
      pages: {
        'main-keys': { 'owner.type': 1, 'owner.id': 1 }
      }
    })
  }
}

const portalsMongo = new PortalsMongo()

export default portalsMongo
