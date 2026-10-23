import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'

const colorPattern = /^#[0-9a-fA-F]{6}$/

/**
 * Application blocks: the colors option becomes `_t_primary`/`_t_secondary` static filters, and the
 * `_s_` static filters, no longer accepted, are dropped. Walks any nesting of page elements.
 * Returns true if something changed.
 */
export const migrateApplicationThemeParams = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false
  let changed = false
  const element = value as Record<string, any>
  if (element.type === 'application') {
    if (Array.isArray(element.staticFilters)) {
      const kept = element.staticFilters.filter((filter: any) => !(typeof filter?.key === 'string' && filter.key.startsWith('_s_')))
      if (kept.length !== element.staticFilters.length) {
        element.staticFilters = kept
        changed = true
      }
    }
    if ('colors' in element) {
      for (const key of ['primary', 'secondary']) {
        const color = element.colors?.[key]
        if (typeof color !== 'string' || !colorPattern.test(color)) continue
        if (!Array.isArray(element.staticFilters)) element.staticFilters = []
        if (element.staticFilters.some((filter: any) => filter?.key === `_t_${key}`)) continue
        element.staticFilters.push({ key: `_t_${key}`, value: color })
      }
      delete element.colors
      changed = true
    }
  }
  for (const child of Object.values(value)) {
    if (migrateApplicationThemeParams(child)) changed = true
  }
  return changed
}

export default {
  description: 'Move the colors of application blocks to _t_* static filters and drop _s_ static filters',
  async exec (db, debug) {
    let count = 0
    for await (const doc of db.collection('pages').find({}, { projection: { config: 1, draftConfig: 1 } })) {
      const $set: Record<string, unknown> = {}
      if (migrateApplicationThemeParams(doc.config)) $set.config = doc.config
      if (migrateApplicationThemeParams(doc.draftConfig)) $set.draftConfig = doc.draftConfig
      if (!Object.keys($set).length) continue
      await db.collection('pages').updateOne({ _id: doc._id }, { $set })
      count++
    }
    debug(`migrated application blocks theme params in ${count} pages`)
  }
} as UpgradeScript
