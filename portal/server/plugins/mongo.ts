import type { Portal } from '../../../api/types/portal/index.js'
import type { Page } from '../../../api/types/page/index.js'
import mongo from '@data-fair/lib-node/mongo.js'

export class PortalMongo {
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
}

export const portalMongo = new PortalMongo()

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  await mongo.connect(config.mongoUrl)
})
