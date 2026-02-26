import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Page, PageElement } from '../../api/types/page/index.ts'

export default {
  description: 'Migrate href property to link object for page-element-image and page-element-card',
  async exec (db, debug) {
    const pages = db.collection<Page>('pages')
    let totalUpdated = 0

    /**
     * Traverse page elements and update href to link object
     * @param pageElements - The page elements to traverse
     * @returns true if any elements were modified
     */
    const traversePageElements = (pageElements: PageElement[] | undefined): boolean => {
      if (!pageElements) return false
      let modified = false

      for (const element of pageElements) {
        // Update image elements
        if (element.type === 'image') {
          if ((element as any).href) {
            element.link = {
              type: 'external',
              target: true,
              href: (element as any).href
            }
            delete (element as any).href
            modified = true
          }
        }

        // Update card elements
        if (element.type === 'card') {
          if ((element as any).href) {
            element.link = {
              type: 'external',
              target: true,
              href: (element as any).href
            }
            delete (element as any).href
            modified = true
          }
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

    // Get all pages and update them
    const pagesCursor = pages.find({})
    for await (const page of pagesCursor) {
      let pageModified = false

      // Update config elements
      if (page.config?.elements) {
        if (traversePageElements(page.config.elements)) {
          pageModified = true
        }
      }

      // Update draftConfig elements
      if (page.draftConfig?.elements) {
        if (traversePageElements(page.draftConfig.elements)) {
          pageModified = true
        }
      }

      // Save the page if it was modified
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
