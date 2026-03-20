import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Page } from '../../api/types/page/index.ts'

export default {
  description: 'Initialize public and permissions fields on all existing pages (public=true, permissions=[])',
  async exec (db, debug) {
    const pages = db.collection<Page>('pages')

    const result = await pages.updateMany(
      { public: { $exists: false } },
      {
        $set: {
          public: true,
          permissions: []
        }
      }
    )

    debug(`Migration completed: initialized permissions on ${result.modifiedCount} pages`)
  }
} as UpgradeScript
