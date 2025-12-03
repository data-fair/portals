import type { Group } from '#types/group/index.ts'
import type { Portal } from '#types/portal/index.ts'
import type { Page } from '#types/page/index.ts'
import type { Use } from '#types/use/index.ts'
import type { Image } from '#types/image/index.js'
import type { FontAsset } from '#types/font-asset/index.js'

import mongo from '@data-fair/lib-node/mongo.js'
import config from './config.ts'

export class PortalsMongo {
  get client () {
    return mongo.client
  }

  get db () {
    return mongo.db
  }

  get groups () {
    return mongo.db.collection<Group>('groups')
  }

  get portals () {
    return mongo.db.collection<Portal>('portals')
  }

  get pages () {
    return mongo.db.collection<Page>('pages')
  }

  get uses () {
    return mongo.db.collection<Use>('uses')
  }

  get images () {
    return mongo.db.collection<Image>('images')
  }

  get fontAssets () {
    return mongo.db.collection<FontAsset>('font-assets')
  }

  async connect () {
    await mongo.connect(config.mongoUrl)
  }

  async init () {
    await this.connect()
    await mongo.configure({
      portals: {
        'main-keys': { 'owner.type': 1, 'owner.id': 1 }
      },
      pages: {
        'main-keys': { 'owner.type': 1, 'owner.id': 1 },
        'unique-event-slug': [{ 'owner.type': 1, 'owner.id': 1, 'config.eventMetadata.slug': 1 }, { unique: true, partialFilterExpression: { 'config.eventMetadata.slug': { $exists: true } } }],
        'unique-news-slug': [{ 'owner.type': 1, 'owner.id': 1, 'config.newsMetadata.slug': 1 }, { unique: true, partialFilterExpression: { 'config.newsMetadata.slug': { $exists: true } } }],
        'unique-generic-slug': [{ 'owner.type': 1, 'owner.id': 1, 'config.genericMetadata.slug': 1 }, { unique: true, partialFilterExpression: { 'config.genericMetadata.slug': { $exists: true } } }]
      },
      uses: {
        'main-keys': { 'owner.type': 1, 'owner.id': 1 },
        'unique-slug': [{ 'owner.type': 1, 'owner.id': 1, slug: 1 }, { unique: true }]
      },
      images: {
        'main-keys': { 'owner.type': 1, 'owner.id': 1, 'resource.type': 1, 'resource._id': 1 }
      },
      'font-assets': {
        'main-keys': { 'owner.type': 1, 'owner.id': 1, key: 1 }
      }
    })
  }
}

const portalsMongo = new PortalsMongo()

export default portalsMongo
