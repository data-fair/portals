import type { Group } from '#types/group/index.ts'
import type { Portal } from '#types/portal/index.ts'
import type { Page } from '#types/page/index.ts'
import type { Image } from '#types/image/index.js'

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

  get images () {
    return mongo.db.collection<Image>('images')
  }

  init = async () => {
    await mongo.connect(config.mongoUrl)
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
      images: {
        'main-keys': { 'owner.type': 1, 'owner.id': 1, 'resource.type': 1, 'resource._id': 1 }
      }
    })
  }
}

const portalsMongo = new PortalsMongo()

export default portalsMongo
