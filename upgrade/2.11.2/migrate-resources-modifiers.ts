import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'

interface ResourceWithOldModifiers {
  _id: string
  created?: { date: string }
  updated?: { date: string }
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

export default {
  description: 'Migrate resources modifiers from created/updated to createdAt/updatedAt for font-assets, images, pages, portals and reuses',
  async exec (db, debug) {
    const resources = ['font-assets', 'groups', 'images', 'pages', 'portals', 'reuses']

    for (const resourceName of resources) {
      const collection = db.collection<ResourceWithOldModifiers>(resourceName)
      let migratedCount = 0

      // Find documents with old modifiers fields
      const documents = await collection.find({
        $or: [
          { created: { $exists: true } },
          { updated: { $exists: true } }
        ]
      }).toArray()

      for (const doc of documents) {
        const patch: { $set?: Record<string, any>, $unset?: Record<string, number> } = {}
        let hasMigration = false

        // Migrate created to createdAt
        if (doc.created !== undefined && doc.createdAt === undefined) {
          if (!patch.$set) patch.$set = {}
          patch.$set.createdAt = doc.created.date
          if (!patch.$unset) patch.$unset = {}
          patch.$unset.created = 1
          hasMigration = true
        }

        // Migrate updated to updatedAt
        if (doc.updated !== undefined && doc.updatedAt === undefined) {
          if (!patch.$set) patch.$set = {}
          patch.$set.updatedAt = doc.updated.date
          if (!patch.$unset) patch.$unset = {}
          patch.$unset.updated = 1
          hasMigration = true
        }

        if (hasMigration) {
          await collection.updateOne({ _id: doc._id }, patch)

          migratedCount++
          debug(`Migrated modifiers for ${resourceName}/${doc._id}`)
        }
      }

      if (migratedCount > 0) {
        debug(`Resource ${resourceName}: ${migratedCount} documents migrated`)
      } else {
        debug(`Resource ${resourceName}: no documents to migrate`)
      }
    }
  }
} as UpgradeScript
