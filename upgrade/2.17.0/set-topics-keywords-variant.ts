import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Portal } from '../../api/types/portal/index.ts'
import type { Page, PageElement } from '../../api/types/page/index.ts'

const setVariant = (obj: any, key: string) => {
  if (obj && obj[key]) {
    if (!obj[key].variant) {
      obj[key].variant = 'outlined'
    }
  }
}

export default {
  description: 'Set topics.variant and keywords.variant to outlined everywhere (portail, pages, page elements)',
  async exec (db, debug) {
    const portals = db.collection<Portal>('portals')
    const pages = db.collection<Page>('pages')

    // Portail config et draftConfig
    for await (const portal of portals.find({})) {
      let changed = false
      for (const configKey of ['config', 'draftConfig'] as const) {
        const cfg = portal[configKey]
        if (!cfg) continue

        // datasets.card
        if (cfg.datasets?.card) {
          setVariant(cfg.datasets.card, 'topics')
          setVariant(cfg.datasets.card, 'keywords')
          changed = true
        }
        // applications.card
        if (cfg.applications?.card) {
          setVariant(cfg.applications.card, 'topics')
          changed = true
        }
        // application.page.datasets.card
        if (cfg.applications?.page?.datasets?.card) {
          setVariant(cfg.applications.page.datasets.card, 'topics')
          setVariant(cfg.applications.page.datasets.card, 'keywords')
          changed = true
        }
        // reuses.page.datasets.card
        if (cfg.reuses?.page?.datasets?.card) {
          setVariant(cfg.reuses.page.datasets.card, 'topics')
          setVariant(cfg.reuses.page.datasets.card, 'keywords')
          changed = true
        }
        // datasets.page.relatedDatasets.card
        if (cfg.datasets?.page?.relatedDatasets?.card) {
          setVariant(cfg.datasets.page.relatedDatasets.card, 'topics')
          setVariant(cfg.datasets.page.relatedDatasets.card, 'keywords')
          changed = true
        }
        // datasets.page.application.card
        if (cfg.datasets?.page?.applications?.card) {
          setVariant(cfg.datasets.page.applications.card, 'topics')
          changed = true
        }
      }
      if (changed) {
        await portals.updateOne({ _id: portal._id }, { $set: { config: portal.config, draftConfig: portal.draftConfig } })
        debug(`Updated portal ${portal._id}`)
      }
    }

    // Pages config et draftConfig
    const traversePageElements = (pageElements: PageElement[] | undefined): boolean => {
      if (!pageElements) return false
      let modified = false
      for (const element of pageElements) {
        // dataset-card, dataset-list, application-list
        if (element.type === 'dataset-card' && element.cardConfig) {
          setVariant(element.cardConfig, 'topics')
          setVariant(element.cardConfig, 'keywords')
          modified = true
        }
        if (element.type === 'datasets-list' && element.cardConfig) {
          setVariant(element.cardConfig, 'topics')
          setVariant(element.cardConfig, 'keywords')
          modified = true
        }
        if (element.type === 'applications-list' && element.cardConfig) {
          setVariant(element.cardConfig, 'topics')
          modified = true
        }

        // Recursively traverse children
        if (element.type === 'card') {
          if (traversePageElements(element.children)) modified = true
        }
        if (element.type === 'banner') {
          if (traversePageElements(element.children)) modified = true
        }
        if (element.type === 'responsive-grid') {
          if (traversePageElements(element.children)) modified = true
        }
        if (element.type === 'datasets-catalog') {
          if (traversePageElements(element.advancedFilters)) modified = true
        }
        if (element.type === 'applications-catalog') {
          if (traversePageElements(element.advancedFilters)) modified = true
        }
        if (element.type === 'reuses-catalog') {
          if (traversePageElements(element.advancedFilters)) modified = true
        }

        if (element.type === 'two-columns') {
          if (traversePageElements(element.children)) modified = true
          if (traversePageElements(element.children2)) modified = true
        }

        if (element.type === 'tabs') {
          for (const tab of element.tabs) {
            if (traversePageElements(tab.children)) modified = true
          }
        }

        if (element.type === 'expansion-panels') {
          for (const panel of element.panels) {
            if (traversePageElements(panel.children)) modified = true
          }
        }
      }
      return modified
    }
    for await (const page of pages.find({})) {
      let pageModified = false
      if (page.config?.elements) {
        if (traversePageElements(page.config.elements)) pageModified = true
      }
      if (page.draftConfig?.elements) {
        if (traversePageElements(page.draftConfig.elements)) pageModified = true
      }
      if (pageModified) {
        await pages.updateOne(
          { _id: page._id },
          {
            $set: {
              config: page.config,
              draftConfig: page.draftConfig,
              updatedAt: new Date().toISOString()
            }
          }
        )
        debug(`Updated page ${page._id}`)
      }
    }
  }
} as UpgradeScript
