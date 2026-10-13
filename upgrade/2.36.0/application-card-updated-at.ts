import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'

const appCardElements = ['applications-catalog', 'applications-list']

/**
 * Application cards always showed their update date, it is now the showUpdatedAt option (hidden by default).
 * Turn it on for the existing application cards. Returns true if something changed.
 */
export const showApplicationsUpdatedAt = (config: any): boolean => {
  let changed = false
  const enable = (card: any) => {
    if (card && typeof card === 'object' && !('showUpdatedAt' in card)) {
      card.showUpdatedAt = true
      changed = true
    }
  }
  enable(config?.applications?.card)
  enable(config?.datasetPage?.applications?.card)
  const walk = (value: any) => {
    if (!value || typeof value !== 'object') return
    if (appCardElements.includes(value.type)) enable(value.cardConfig)
    for (const child of Object.values(value)) walk(child)
  }
  walk(config)
  return changed
}

export default {
  description: 'Keep the update date displayed on existing application cards',
  async exec (db, debug) {
    for (const collection of ['portals', 'pages']) {
      let count = 0
      for await (const doc of db.collection(collection).find({}, { projection: { config: 1, draftConfig: 1 } })) {
        const $set: Record<string, unknown> = {}
        if (showApplicationsUpdatedAt(doc.config)) $set.config = doc.config
        if (showApplicationsUpdatedAt(doc.draftConfig)) $set.draftConfig = doc.draftConfig
        if (!Object.keys($set).length) continue
        await db.collection(collection).updateOne({ _id: doc._id }, { $set })
        count++
      }
      debug(`showed the update date on application cards in ${count} ${collection}`)
    }
  }
} as UpgradeScript
