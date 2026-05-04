import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Page, PageElement } from '../../api/types/page/index.ts'

export default {
  description: "Migrate datasets-catalog defaultSort from 'dataUpdatedAt:-1' to 'modified:-1'",
  async exec (db, debug) {
    const pages = db.collection<Page>('pages')
    let totalUpdated = 0

    const pagesCursor = pages.find({})
    for await (const page of pagesCursor) {
      let pageModified = false

      const migrateElement = (element: PageElement) => {
        if (element.type !== 'datasets-catalog') return
        const el = element as Record<string, unknown>
        if (el.defaultSort === 'dataUpdatedAt:-1') {
          el.defaultSort = 'modified:-1'
          pageModified = true
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
