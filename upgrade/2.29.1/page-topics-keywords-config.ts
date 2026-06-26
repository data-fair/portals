import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Portal } from '../../api/types/portal/index.ts'

// Preserve the previous rendering on existing portals: topics were not shown on
// detail pages, and dataset keywords were displayed as secondary tonal chips.
const setPageDefaults = (cfg: any): boolean => {
  if (!cfg) return false
  let changed = false

  if (cfg.datasets?.page) {
    if (!cfg.datasets.page.topics) {
      cfg.datasets.page.topics = { show: false }
      changed = true
    }
    if (!cfg.datasets.page.keywords) {
      cfg.datasets.page.keywords = { show: true, color: 'secondary', elevation: 0, density: 'compact', rounded: 'xl', variant: 'tonal' }
      changed = true
    }
  }

  if (cfg.applications?.page && !cfg.applications.page.topics) {
    cfg.applications.page.topics = { show: false }
    changed = true
  }

  return changed
}

export default {
  description: 'Seed dataset/application page topics & keywords config to preserve the current rendering on existing portals',
  async exec (db, debug) {
    const portals = db.collection<Portal>('portals')

    for await (const portal of portals.find({})) {
      let changed = false
      for (const configKey of ['config', 'draftConfig'] as const) {
        if (setPageDefaults(portal[configKey])) changed = true
      }
      if (changed) {
        await portals.updateOne({ _id: portal._id }, { $set: { config: portal.config, draftConfig: portal.draftConfig } })
        debug(`Updated portal ${portal._id}`)
      }
    }
  }
} as UpgradeScript
