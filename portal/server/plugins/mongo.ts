import type { Portal } from '../../../api/types/portal'
import type { Page } from '../../../api/types/page'
import type { Image } from '../../../api/types/image'
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

  get images () {
    return mongo.db.collection<Image>('images')
  }
}

export const portalMongo = new PortalMongo()

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  await mongo.connect(config.mongoUrl)
})
