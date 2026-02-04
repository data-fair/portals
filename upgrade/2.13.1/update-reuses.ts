import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Reuse } from '../../api/types/reuse/index.ts'

export default {
  description: 'Add draftConfig field to reuses',
  async exec (db, debug) {
    const reuses = db.collection<Reuse>('reuses')

    const result = await reuses.updateMany(
      {
        config: { $exists: true },
        draftConfig: { $exists: false }
      },
      [{ $set: { draftConfig: '$config' } }]
    )

    debug(`Updated ${result.modifiedCount} reuses with draftConfig field`)
  }
} as UpgradeScript
