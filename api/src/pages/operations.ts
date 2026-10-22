// operations.ts — pure functions only
// must not import #mongo, #config, or store state
import type { PageElement, PageConfig } from '#types/page/index.ts'
import slug from 'slugify'

export const traversePageElements = async (pageElements: PageElement[] | undefined, callback: (pageElement: PageElement) => Promise<void> | void) => {
  if (!pageElements) return
  for (const element of pageElements) {
    await callback(element)
    if (element.type === 'card') await traversePageElements(element.children, callback)
    if (element.type === 'banner') await traversePageElements(element.children, callback)
    if (element.type === 'responsive-grid') await traversePageElements(element.children, callback)

    // Catalog blocks can host arbitrary elements (incl. topics) as custom "advanced filters".
    if (element.type === 'applications-catalog') await traversePageElements(element.advancedFilters, callback)
    if (element.type === 'datasets-catalog') await traversePageElements(element.advancedFilters, callback)
    if (element.type === 'event-catalog') await traversePageElements(element.advancedFilters, callback)
    if (element.type === 'news-catalog') await traversePageElements(element.advancedFilters, callback)
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

// Resolve each anchored title's slug from its content (deduplicating in document order)
// and build the table of contents. The resolved slug is stored on the element (anchor._slug)
// so the rendered title and the table of contents share the same identifier.
export const resolvePageAnchors = async (pageConfig: PageConfig) => {
  const toc: NonNullable<PageConfig['_toc']> = []
  const seen = new Set<string>()
  await traversePageElements(pageConfig.elements, (element) => {
    if (element.type !== 'title' || !element.anchor) return
    if (!element.anchor.enabled) {
      delete element.anchor._slug
      return
    }
    const base = slug.default(element.content || 'section', { lower: true, strict: true }) || 'section'
    let candidate = base
    let counter = 2
    while (seen.has(candidate)) candidate = `${base}-${counter++}`
    seen.add(candidate)
    element.anchor._slug = candidate
    if (element.anchor.inToc) {
      const label = element.anchor.label?.trim()
      toc.push({ id: candidate, title: label || element.content || candidate })
    }
  })
  return toc
}
