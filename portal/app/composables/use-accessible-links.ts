import type { SimpleLinkItem } from '#api/types/common-links/index.ts'
import type { MenuItem } from '#api/types/portal/index.ts'

type StandardPageType = 'contact' | 'accessibility' | 'terms-of-service' | 'legal-notice' | 'privacy-policy' | 'cookie-policy' | 'applications' | 'datasets' | 'reuses' | 'event-catalog' | 'news-catalog'

const STANDARD_PAGE_TYPES_WITH_PERMISSIONS = new Set<string>([
  'contact', 'accessibility', 'terms-of-service', 'legal-notice', 'privacy-policy',
  'cookie-policy', 'applications', 'datasets', 'reuses', 'event-catalog', 'news-catalog'
])

/**
 * Composable that filters links/menu items based on page accessibility.
 * Uses the standard-exists API (permission-aware) for standard pages.
 * Uses HEAD requests for event/news/generic page slugs.
 *
 * State (standardExists fetch + slugCache) is shared across all instances.
 */
export const useAccessibleLinks = () => {
  // useFetch deduplicates requests with the same URL across component instances
  const { data: standardExists } = useLocalFetch<Record<StandardPageType, boolean>>('/portal/api/pages/standard-exists')

  // Shared slug cache across all composable instances to avoid duplicate HEAD requests
  const slugCache = useState<Record<string, boolean>>('portal-slug-access-cache', () => ({}))

  const checkSlugAccess = (type: string, slug: string): boolean => {
    const key = `${type}/${slug}`
    if (key in slugCache.value) return !!slugCache.value[key]
    if (import.meta.client) {
      $fetch(`/portal/api/pages/${type}/${slug}`, { method: 'HEAD' }).then(() => {
        slugCache.value[key] = true
      }).catch(() => {
        slugCache.value[key] = false
      })
    }
    return true // Optimistic: show until check resolves
  }

  const isLinkAccessible = (link: SimpleLinkItem | MenuItem): boolean => {
    if (!link) return false
    if (link.type === 'external' || link.type === 'none' || link.type === 'submenu') return true

    if (link.type === 'standard') {
      if (!STANDARD_PAGE_TYPES_WITH_PERMISSIONS.has(link.subtype ?? '')) return true
      if (!standardExists.value) return true
      return standardExists.value[link.subtype as StandardPageType] !== false
    }

    if (link.type === 'event' || link.type === 'news' || link.type === 'generic') {
      const slug = link.pageRef?.slug
      if (!slug) return true
      return checkSlugAccess(link.type, slug)
    }

    return true
  }

  const filterLinks = <T extends SimpleLinkItem | MenuItem>(links: T[]): T[] => {
    return links.filter(link => isLinkAccessible(link))
  }

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => isLinkAccessible(item))
      .map(item => {
        if (item.type === 'submenu' && item.children) {
          return { ...item, children: filterMenuItems(item.children) }
        }
        return item
      })
      .filter(item => item.type !== 'submenu' || !item.children || item.children.length > 0)
  }

  return { filterLinks, filterMenuItems }
}
