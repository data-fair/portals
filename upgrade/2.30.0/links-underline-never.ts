import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Portal } from '../../api/types/portal/index.ts'

export default {
  description: 'Keep existing portals visually unchanged by opting them out of the new text links underline',
  async exec (db, debug) {
    const portals = db.collection<Portal>('portals')

    const config = await portals.updateMany(
      { 'config.linksConfig.underline': { $exists: false } },
      { $set: { 'config.linksConfig.underline': 'never' } }
    )
    const draftConfig = await portals.updateMany(
      { 'draftConfig.linksConfig.underline': { $exists: false } },
      { $set: { 'draftConfig.linksConfig.underline': 'never' } }
    )

    debug(`Disabled links underline on ${config.modifiedCount} configs and ${draftConfig.modifiedCount} draft configs`)
  }
} as UpgradeScript
