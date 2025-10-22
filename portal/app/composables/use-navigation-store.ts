import type { VBreadcrumbs } from 'vuetify/components'
import type { LinkItem, MenuItem } from '#api/types/portal'

type BreadcrumbItems = NonNullable<VBreadcrumbs['$props']['items']>

export type NavigationStore = ReturnType<typeof createNavigationStore>
const navigationStoreKey = Symbol('navigation-store')

const createNavigationStore = () => {
  const _breadcrumbs = ref<BreadcrumbItems>([])
  const drawer = ref(false) // Simple boolean shared between navigations components

  const setBreadcrumbs = (breadcrumbItems: BreadcrumbItems) => {
    _breadcrumbs.value = breadcrumbItems
  }

  const clearBreadcrumbs = () => { _breadcrumbs.value = [] }
  const showBreadcrumbs = computed(() => _breadcrumbs.value.length > 0)

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
          case 'sitemap': return '/sitemap'
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

  const resolveLinkTitle = (link: LinkItem | MenuItem, locale: 'fr' | 'en'): string => {
    if (link.title) return link.title
    switch (link.type) {
      case 'standard': {
        switch (link.subtype) {
          case 'home': return i18n[locale]['homePage']
          case 'contact': return i18n[locale]['contactPage']
          case 'privacy-policy': return i18n[locale]['privacyPolicyPage']
          case 'datasets': return i18n[locale]['datasetsPage']
          case 'applications': return i18n[locale]['applicationsPage']
          case 'news': return i18n[locale]['newsPage']
          case 'event': return i18n[locale]['eventPage']
          case 'sitemap': return i18n[locale]['sitemapPage']
          default: return i18n[locale]['standardPage']
        }
      }
      case 'event': return link.pageRef.title
      case 'news': return link.pageRef.title
      case 'generic': return link.pageRef.title
      case 'external': return link.title
      default: return i18n[locale]['link']
    }
  }

  return {
    breadcrumbs: _breadcrumbs,
    showBreadcrumbs,
    setBreadcrumbs,
    clearBreadcrumbs,
    isMenuItemActive,
    resolveLink,
    resolveLinkTitle,
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

const i18n = {
  en: {
    homePage: 'Home',
    contactPage: 'Contact',
    privacyPolicyPage: 'Privacy Policy',
    datasetsPage: 'Datasets',
    applicationsPage: 'Applications',
    newsPage: 'News',
    eventPage: 'Event',
    sitemapPage: 'Sitemap',
    standardPage: 'Standard Page',
    link: 'Link'
  },
  fr: {
    homePage: 'Accueil',
    contactPage: 'Contact',
    privacyPolicyPage: 'Politique de confidentialité',
    datasetsPage: 'Catalogue de données',
    applicationsPage: 'Catalogue de visualisations',
    newsPage: 'Actualités',
    eventPage: 'Page d\'événement',
    sitemapPage: 'Plan du site',
    standardPage: 'Page standard',
    link: 'Lien'
  }
}
