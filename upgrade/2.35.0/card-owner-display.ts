import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'

/**
 * Replace the showDepartment boolean of dataset and application cards (stored under `card`
 * or `cardConfig` keys) by the ownerDisplay selector. Returns true if something changed.
 * The dataset/application page metadata also has a showDepartment option, left untouched.
 */
export const migrateCardOwnerDisplay = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false
  let changed = false
  for (const [key, child] of Object.entries(value)) {
    if ((key === 'card' || key === 'cardConfig') && child && typeof child === 'object' && 'showDepartment' in child) {
      const card = child as Record<string, unknown>
      if (!('ownerDisplay' in card)) card.ownerDisplay = card.showDepartment === false ? 'none' : 'avatar'
      delete card.showDepartment
      changed = true
    }
    if (migrateCardOwnerDisplay(child)) changed = true
  }
  return changed
}

export default {
  description: 'Replace the showDepartment option of dataset and application cards by the ownerDisplay selector',
  async exec (db, debug) {
    for (const collection of ['portals', 'pages']) {
      let count = 0
      for await (const doc of db.collection(collection).find({}, { projection: { config: 1, draftConfig: 1 } })) {
        const $set: Record<string, unknown> = {}
        if (migrateCardOwnerDisplay(doc.config)) $set.config = doc.config
        if (migrateCardOwnerDisplay(doc.draftConfig)) $set.draftConfig = doc.draftConfig
        if (!Object.keys($set).length) continue
        await db.collection(collection).updateOne({ _id: doc._id }, { $set })
        count++
      }
      debug(`migrated cards owner display in ${count} ${collection}`)
    }
  }
} as UpgradeScript
