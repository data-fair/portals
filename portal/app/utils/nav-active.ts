// Pure navigation-matching helpers, kept free of Nuxt/Vue runtime deps so they
// can be unit-tested directly (see tests/features/portal-rendering/nav-active-tab.unit.spec.ts).
// Relative imports (not the #api alias) so the root tsconfig that type-checks the
// unit test resolves them — that config has no #api alias.
import type { MenuItem } from '../../../api/types/portal/index.ts'
import type { SimpleLinkItem } from '../../../api/types/common-links/index.ts'

/** Resolve a link or menu item to its corresponding URL path */
export const resolveMenuLink = (link: SimpleLinkItem | MenuItem): string | undefined => {
  switch (link.type) {
    case 'standard': {
      switch (link.subtype) {
        case 'home': return '/'
        case 'contact': return '/contact'
        case 'accessibility': return '/accessibility'
        case 'terms-of-service': return '/terms-of-service'
        case 'legal-notice': return '/legal-notice'
        case 'privacy-policy': return '/privacy-policy'
        case 'cookie-policy': return '/cookie-policy'
        case 'datasets': return '/datasets'
        case 'applications': return '/applications'
        case 'reuses': return '/reuses'
        case 'event-catalog': return '/event'
        case 'news-catalog': return '/news'
        case 'sitemap': return '/sitemap'
        case 'catalog-api-doc': return '/catalog-api-doc'
        default: return undefined
      }
    }
    case 'event': return link.pageRef ? `/event/${link.pageRef.slug}` : undefined
    case 'news': return link.pageRef ? `/news/${link.pageRef.slug}` : undefined
    case 'generic': return link.pageRef ? `/pages${link.pageRef.group ? `-${link.pageRef.group.slug}` : ''}/${link.pageRef.slug}` : undefined
    case 'external': return link.href
    default: return undefined
  }
}

/** Check if a menu item (or any of its children) matches the current route path */
export const isMenuItemActive = (item: MenuItem, currentPath: string): boolean => {
  if (item.type === 'external') return false

  // Check if any child of the submenu matches the route
  if (item.type === 'submenu' && item.children) {
    return item.children.some(child => isMenuItemActive(child, currentPath))
  }

  // Resolve the link to compare with the current route
  const resolvedLink = resolveMenuLink(item)
  if (!resolvedLink) return false

  // Exact match or child route (e.g. /datasets matches /datasets/datasetid)
  return currentPath === resolvedLink || currentPath.startsWith(resolvedLink + '/')
}

/**
 * Index of the nav item to highlight for the current route.
 *
 * The breadcrumb knows a page's real group (fetched from the server); the tab bar
 * only sees URLs. A group's sub-page (`/pages-<group>/<slug>`) matches no tab, so
 * Vuetify's mandatory selection used to fall back to the first tab. Passing the
 * group's root-page path lets the tab that points at it light up instead.
 *
 * Two passes so a sub-page that is itself listed in the menu wins over its parent:
 *  1. a direct URL match (the page itself),
 *  2. otherwise the tab pointing at the current page's group root page.
 */
export const findActiveMenuIndex = (
  navigation: MenuItem[],
  currentPath: string,
  groupRootPath?: string
): number | undefined => {
  for (const [i, item] of navigation.entries()) {
    if (isMenuItemActive(item, currentPath)) return i
  }
  if (groupRootPath) {
    for (const [i, item] of navigation.entries()) {
      if (isMenuItemActive(item, groupRootPath)) return i
    }
  }
  return undefined
}
