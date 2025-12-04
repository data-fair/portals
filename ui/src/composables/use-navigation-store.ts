import type { LinkItem, MenuItem } from '#api/types/portal-config'

const drawer = ref(false)
const personalDrawer = ref(false)
const setBreadcrumbs = () => {}
const clearBreadcrumbs = () => {}
const showBreadcrumbs = computed(() => {
  console.warn('showBreadcrumbs is used in portals-manager')
  return true
})

const isMenuItemActive = (_item: any, _currentPath: string): boolean => { return false }
const resolveLink = (_link: any | any) => { return undefined }

const resolveLinkTitle = (link: LinkItem | MenuItem, locale: string): string => {
  const lang = (locale !== 'en' && locale !== 'fr') ? 'en' : locale

  if (!link) return ''
  if (link.title) return link.title
  switch (link.type) {
    case 'standard': {
      switch (link.subtype) {
        case 'home': return i18n[lang]['homePage']
        case 'contact': return i18n[lang]['contactPage']
        case 'privacy-policy': return i18n[lang]['privacyPolicyPage']
        case 'accessibility': return i18n[lang]['accessibilityPage']
        case 'legal-notice': return i18n[lang]['legalNoticePage']
        case 'cookie-policy': return i18n[lang]['cookiePolicyPage']
        case 'terms-of-service': return i18n[lang]['termsOfServicePage']
        case 'datasets': return i18n[lang]['datasetsPage']
        case 'applications': return i18n[lang]['applicationsPage']
        case 'news': return i18n[lang]['newsPage']
        case 'event': return i18n[lang]['eventPage']
        case 'reuses': return i18n[lang]['reusesPage']
        case 'sitemap': return i18n[lang]['sitemapPage']
        default: return i18n[lang]['standardPage']
      }
    }
    case 'event': return link.pageRef?.title
    case 'news': return link.pageRef?.title
    case 'generic': return link.pageRef?.title
    case 'external': return link.title
    default: return i18n[lang]['link']
  }
}

export const useNavigationStore = () => {
  return {
    breadcrumbs: ref([]),
    showBreadcrumbs,
    setBreadcrumbs,
    clearBreadcrumbs,
    isMenuItemActive,
    resolveLink,
    resolveLinkTitle,
    drawer,
    personalDrawer
  }
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
