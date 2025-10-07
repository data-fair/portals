import type { VBreadcrumbs } from 'vuetify/components'
import type { LinkItem, MenuItem } from '#api/types/portal'

type BreadcrumbItems = NonNullable<VBreadcrumbs['$props']['items']>

export type NavigationStore = ReturnType<typeof createNavigationStore>
const navigationStoreKey = Symbol('navigation-store')

const createNavigationStore = () => {
  const _breadcrumbs = ref<BreadcrumbItems>([])
  const _breadcrumbsRouteName = ref<string | null>(null)
  const drawer = ref(false) // Simple boolean shared between navigations components

  const setBreadcrumbs = (breadcrumbItems: BreadcrumbItems, routeName?: string) => {
    _breadcrumbs.value = breadcrumbItems
    _breadcrumbsRouteName.value = routeName || null
  }

  const clearBreadcrumbs = () => {
    _breadcrumbs.value = []
    _breadcrumbsRouteName.value = null
  }

  const showBreadcrumbs = computed(() => {
    const { name } = useRoute()
    return _breadcrumbs.value.length > 0 && _breadcrumbsRouteName.value === name
  })

  /** Check if a menu item (or any of its children) matches the current route */
  const isMenuItemActive = (item: MenuItem, currentPath: string): boolean => {
    if (item.type === 'external') return false

    // Check if any child of the submenu matches the route
    if (item.type === 'submenu' && item.children) {
      return item.children.some(child => isMenuItemActive(child, currentPath))
    }

    // Resolve the link to compare with the current route
    const resolvedLink = resolveLink(item)
    if (!resolvedLink) return false

    // Exact match only - avoid activating parent routes
    return resolvedLink === currentPath
  }

  /** Resolve a link or menu item to its corresponding URL path */
  const resolveLink = (link: LinkItem | MenuItem): string | undefined => {
    switch (link.type) {
      case 'standard': {
        switch (link.subtype) {
          case 'home': return '/'
          case 'contact': return '/contact'
          case 'privacy-policy': return '/privacy-policy'
          case 'datasets': return '/datasets'
          case 'applications': return '/applications'
          case 'news': return '/news'
          case 'event': return '/event'
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

  return {
    breadcrumbs: _breadcrumbs,
    showBreadcrumbs,
    setBreadcrumbs,
    clearBreadcrumbs,
    isMenuItemActive,
    resolveLink,
    drawer
  }
}

export const provideNavigationStore = () => {
  const store = createNavigationStore()
  provide(navigationStoreKey, store)
  return store
}

export const useNavigationStore = () => {
  const store = inject(navigationStoreKey) as NavigationStore | undefined
  if (!store) throw new Error('breadcrumbs store was not initialized')
  return store
}
