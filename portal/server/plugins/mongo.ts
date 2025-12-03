import type { Portal } from '../../../api/types/portal'
import type { Page } from '../../../api/types/page'
import type { Reuse } from '../../../api/types/reuse'
import type { Image } from '../../../api/types/image'
import type { FontAsset } from '../../../api/types/font-asset'
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

  get reuses () {
    return mongo.db.collection<Reuse>('reuses')
  }

  get images () {
    return mongo.db.collection<Image>('images')
  }

  get fontAssets () {
    return mongo.db.collection<FontAsset>('font-assets')
  }
}

export const portalMongo = new PortalMongo()

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  await mongo.connect(config.mongoUrl)
})
