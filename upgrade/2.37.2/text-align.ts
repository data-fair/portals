import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'

/**
 * Text blocks: the centered option becomes the center value of align. Walks any nesting of
 * page elements. Returns true if something changed.
 */
export const migrateTextAlign = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false
  let changed = false
  const element = value as Record<string, any>
  if (element.type === 'text' && 'centered' in element) {
    if (element.centered) element.align = 'center'
    delete element.centered
    changed = true
  }
  for (const child of Object.values(value)) {
    if (migrateTextAlign(child)) changed = true
  }
  return changed
}

export default {
  description: 'Replace the centered option of text blocks by the align option',
  async exec (db, debug) {
    let count = 0
    for await (const doc of db.collection('pages').find({}, { projection: { config: 1, draftConfig: 1 } })) {
      const $set: Record<string, unknown> = {}
      if (migrateTextAlign(doc.config)) $set.config = doc.config
      if (migrateTextAlign(doc.draftConfig)) $set.draftConfig = doc.draftConfig
      if (!Object.keys($set).length) continue
      await db.collection('pages').updateOne({ _id: doc._id }, { $set })
      count++
    }
    debug(`migrated text blocks alignment in ${count} pages`)
  }
} as UpgradeScript
