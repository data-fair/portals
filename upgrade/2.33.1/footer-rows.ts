import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Portal } from '../../api/types/portal/index.ts'
import { migrateLegacyFooter, type LegacyFooter } from './legacy-footer.ts'

export default {
  description: 'Convert the legacy footer options into rows, columns and blocks, keeping a backup of the old configuration',
  async exec (db, debug) {
    const portals = db.collection<Portal>('portals')
    let count = 0
    const cursor = portals.find({
      $or: [
        { 'config.footer': { $exists: true }, 'config.footer.rows': { $exists: false } },
        { 'draftConfig.footer': { $exists: true }, 'draftConfig.footer.rows': { $exists: false } }
      ]
    })
    for await (const portal of cursor) {
      const $set: Record<string, unknown> = {}
      const whiteLabel = !!portal.whiteLabel
      const config = portal.config as any
      const draftConfig = portal.draftConfig as any
      if (config?.footer && !config.footer.rows) {
        if (!portal.legacyFooter) $set.legacyFooter = config.footer
        $set['config.footer'] = migrateLegacyFooter(config.footer as LegacyFooter, whiteLabel)
      }
      if (draftConfig?.footer && !draftConfig.footer.rows) {
        if (!portal.legacyDraftFooter) $set.legacyDraftFooter = draftConfig.footer
        $set['draftConfig.footer'] = migrateLegacyFooter(draftConfig.footer as LegacyFooter, whiteLabel)
      }
      await portals.updateOne({ _id: portal._id }, { $set })
      count++
      debug(`migrated footer of portal ${portal._id} (${portal.title})`)
    }
    debug(`migrated ${count} portals`)
  }
} as UpgradeScript
