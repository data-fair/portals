import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'

/**
 * Application cards always showed their update date, it is now the showUpdatedAt option (hidden by default).
 * Turn it on for the portal application card only: page elements and the dataset page merge their own card
 * over this one, so they inherit it. Returns true if something changed.
 */
export const showApplicationsUpdatedAt = (config: any): boolean => {
  if (!config || typeof config !== 'object') return false
  config.applications ??= {}
  config.applications.card ??= {}
  if ('showUpdatedAt' in config.applications.card) return false
  config.applications.card.showUpdatedAt = true
  return true
}

export default {
  description: 'Keep the update date displayed on existing application cards',
  async exec (db, debug) {
    let count = 0
    for await (const doc of db.collection('portals').find({}, { projection: { config: 1, draftConfig: 1 } })) {
      const $set: Record<string, unknown> = {}
      if (showApplicationsUpdatedAt(doc.config)) $set.config = doc.config
      if (showApplicationsUpdatedAt(doc.draftConfig)) $set.draftConfig = doc.draftConfig
      if (!Object.keys($set).length) continue
      await db.collection('portals').updateOne({ _id: doc._id }, { $set })
      count++
    }
    debug(`showed the update date on application cards in ${count} portals`)
  }
} as UpgradeScript
