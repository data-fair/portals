import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Page, PageElement } from '../../api/types/page/index.ts'

export default {
  description: 'Migrate syncParams boolean to string enum (none | sandboxed | shared-filters) for application and dataset-table elements',
  async exec (db, debug) {
    const pages = db.collection<Page>('pages')
    let totalUpdated = 0

    const pagesCursor = pages.find({})
    for await (const page of pagesCursor) {
      let pageModified = false

      const migrateElement = (element: PageElement) => {
        if (element.type === 'application' || element.type === 'dataset-table') {
          const el = element as any
          if (el.syncParams === true) {
            el.syncParams = 'sandboxed'
            pageModified = true
          } else if (el.syncParams === false) {
            delete el.syncParams
            pageModified = true
          }
        }
      }

      await traversePageElements(page.config?.elements, migrateElement)
      await traversePageElements(page.draftConfig?.elements, migrateElement)

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
        totalUpdated++
      }
    }

    debug(`Migration completed: updated ${totalUpdated} pages`)
  }
} as UpgradeScript

// Copy of /api/src/pages/service.ts#traversePageElements to keep independence of the upgrade
const traversePageElements = async (pageElements: PageElement[] | undefined, callback: (pageElement: PageElement) => Promise<void> | void) => {
  if (!pageElements) return
  for (const element of pageElements) {
    await callback(element)
    if (element.type === 'card') await traversePageElements(element.children, callback)
    if (element.type === 'banner') await traversePageElements(element.children, callback)
    if (element.type === 'responsive-grid') await traversePageElements(element.children, callback)
    if (element.type === 'datasets-catalog') await traversePageElements(element.advancedFilters, callback)
    if (element.type === 'applications-catalog') await traversePageElements(element.advancedFilters, callback)
    if (element.type === 'reuses-catalog') await traversePageElements(element.advancedFilters, callback)

    if (element.type === 'two-columns') {
      await traversePageElements(element.children, callback)
      await traversePageElements(element.children2, callback)
    }

    if (element.type === 'tabs') {
      for (const tab of element.tabs) {
        await traversePageElements(tab.children, callback)
      }
    }

    if (element.type === 'expansion-panels') {
      for (const tab of element.panels) {
        await traversePageElements(tab.children, callback)
      }
    }
  }
}
