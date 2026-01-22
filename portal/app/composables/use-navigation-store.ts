import type { VBreadcrumbs } from 'vuetify/components'
import type { LinkItem, MenuItem } from '#api/types/portal'

type BreadcrumbItem = BreadcrumbItems[number]
type BreadcrumbItems = NonNullable<VBreadcrumbs['$props']['items']>

type NavigationStoreOptions = { isIframe: Ref<boolean> }
export type NavigationStore = ReturnType<typeof createNavigationStore>
const navigationStoreKey = Symbol('navigation-store')

const createNavigationStore = (options: NavigationStoreOptions) => {
  const { $portal } = useNuxtApp()
  const _breadcrumbs = ref<BreadcrumbItems>([])
  const drawer = ref(false) // Simple boolean shared between navigations components
  const personalDrawer = ref(true) // Simple boolean shared between personal navigations components
  const isIframe = options.isIframe
  const showBreadcrumbsOverride = ref<boolean | undefined>(undefined)

  const setBreadcrumbs = (breadcrumbInputs: (LinkItem | BreadcrumbItem)[]) => {
    const { $i18n } = useNuxtApp()
    const locale = $i18n.locale.value as 'fr' | 'en'
    _breadcrumbs.value = breadcrumbInputs.map(input => {
      // If it's already a breadcrumb item (has title property and no type property), return as is
      if (typeof input === 'object' && 'title' in input && !('type' in input)) {
        return input as BreadcrumbItem
      }

      // Otherwise, it's a LinkItem, resolve it
      const linkItem = input as LinkItem
      const title = resolveLinkTitle(linkItem, locale)
      const resolvedLink = resolveLink(linkItem)

      const breadcrumbItem: BreadcrumbItem = { title }

      // Use 'to' for internal links, 'href' for external
      if (linkItem.type === 'external' && isExternalLink(linkItem)) breadcrumbItem.to = resolvedLink
      else if (resolvedLink) breadcrumbItem.to = resolvedLink
      else breadcrumbItem.disabled = true

      return breadcrumbItem
    })
  }

  const clearBreadcrumbs = () => { _breadcrumbs.value = [] }

  const setShowBreadcrumbs = (value?: boolean) => { showBreadcrumbsOverride.value = value }
  const showBreadcrumbs = (place: 'top' | 'bottom') => {
    if (showBreadcrumbsOverride.value === false) return false
    if (isIframe.value) return false
    const pos = $portal.config.breadcrumb.position
    if (pos === 'both') return true
    return place === 'top' ? pos === 'below-nav' : pos === 'above-footer'
  }

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

  /** Check if a link is external (not internal and not starting with /) */
  const isExternalLink = (link: LinkItem | MenuItem): boolean => {
    if (link.type === 'external') return !link.href.startsWith('/')
    return false
  }

  /** Resolve a link or menu item to its corresponding URL path */
  const resolveLink = (link: LinkItem | MenuItem): string | undefined => {
    switch (link.type) {
      case 'standard': {
        switch (link.subtype) {
          case 'home': return '/'
          case 'contact': return '/contact'
          case 'privacy-policy': return '/privacy-policy'
          case 'accessibility': return '/accessibility'
          case 'legal-notice': return '/legal-notice'
          case 'cookie-policy': return '/cookie-policy'
          case 'terms-of-service': return '/terms-of-service'
          case 'datasets': return '/datasets'
          case 'applications': return '/applications'
          case 'news': return '/news'
          case 'event': return '/event'
          case 'reuses': return '/reuses'
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
          case 'accessibility': return i18n[locale]['accessibilityPage']
          case 'legal-notice': return i18n[locale]['legalNoticePage']
          case 'cookie-policy': return i18n[locale]['cookiePolicyPage']
          case 'terms-of-service': return i18n[locale]['termsOfServicePage']
          case 'datasets': return i18n[locale]['datasetsPage']
          case 'applications': return i18n[locale]['applicationsPage']
          case 'news': return i18n[locale]['newsPage']
          case 'event': return i18n[locale]['eventPage']
          case 'reuses': return i18n[locale]['reusesPage']
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
    setBreadcrumbs,
    clearBreadcrumbs,
    isMenuItemActive,
    isExternalLink,
    resolveLink,
    resolveLinkTitle,
    drawer,
    personalDrawer,
    showBreadcrumbs,
    setShowBreadcrumbs,
    isIframe
  }
}

export const provideNavigationStore = (options: NavigationStoreOptions) => {
  const store = createNavigationStore(options)
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
    accessibilityPage: 'Accessibility',
    legalNoticePage: 'Legal Notice',
    cookiePolicyPage: 'Cookie Policy',
    termsOfServicePage: 'Terms of Service',
    datasetsPage: 'Datasets',
    applicationsPage: 'Applications',
    newsPage: 'News',
    eventPage: 'Event',
    reusesPage: 'Reuses',
    sitemapPage: 'Sitemap',
    standardPage: 'Standard Page',
    link: 'Link'
  },
  fr: {
    homePage: 'Accueil',
    contactPage: 'Contact',
    privacyPolicyPage: 'Politique de confidentialité',
    accessibilityPage: 'Accessibilité',
    legalNoticePage: 'Mentions légales',
    cookiePolicyPage: 'Politique de cookies',
    termsOfServicePage: "Conditions générales d'utilisation",
    datasetsPage: 'Catalogue de données',
    applicationsPage: 'Catalogue de visualisations',
    newsPage: 'Actualités',
    eventPage: 'Événement',
    reusesPage: 'Réutilisations',
    sitemapPage: 'Plan du site',
    standardPage: 'Page standard',
    link: 'Lien'
  }
}
