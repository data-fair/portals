import type { MenuItem } from '#api/types/portal/index.ts'
import type { SimpleLinkItem, LinkItem } from '#api/types/portal-config-links/index.ts'

const isExternalLink = (link: SimpleLinkItem | MenuItem): boolean => {
  if (link.type === 'external') return !link.href?.startsWith('/')
  return false
}

const resolveLinkTitle = (link: LinkItem | MenuItem, locale: string): string => {
  const lang = (locale !== 'en' && locale !== 'fr') ? 'en' : locale

  if (!link) return ''
  if (link.title) return link.title
  switch (link.type) {
    case 'standard': {
      switch (link.subtype) {
        case 'home': return i18n[lang]['homePage']
        case 'contact': return i18n[lang]['contactPage']
        case 'accessibility': return i18n[lang]['accessibilityPage']
        case 'terms-of-service': return i18n[lang]['termsOfServicePage']
        case 'legal-notice': return i18n[lang]['legalNoticePage']
        case 'privacy-policy': return i18n[lang]['privacyPolicyPage']
        case 'cookie-policy': return i18n[lang]['cookiePolicyPage']
        case 'datasets': return i18n[lang]['datasetsPage']
        case 'applications': return i18n[lang]['applicationsPage']
        case 'news-catalog': return i18n[lang]['newsPage']
        case 'event-catalog': return i18n[lang]['eventPage']
        case 'reuses': return i18n[lang]['reusesPage']
        case 'sitemap': return i18n[lang]['sitemapPage']
        case 'catalog-api-doc': return i18n[lang]['catalogApiDocPage']
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
    breadcrumbs: ref([{ title: 'Page libre', to: '/my-page' }]),
    setBreadcrumbs: () => { },
    showTopBreadcrumbs: ref(false),
    showBottomBreadcrumbs: ref(false),
    clearBreadcrumbs: () => { },
    isMenuItemActive: (_item: any, _currentPath: string): boolean => false,
    isExternalLink,
    resolveLink: (_link: any) => undefined,
    resolveLinkTitle,
    drawer: ref(false),
    personalDrawer: ref(false),
    isIframe: ref(false)
  }
}

const i18n = {
  en: {
    homePage: 'Home',
    contactPage: 'Contact',
    accessibilityPage: 'Accessibility',
    termsOfServicePage: 'Terms of Service',
    legalNoticePage: 'Legal Notice',
    privacyPolicyPage: 'Privacy Policy',
    cookiePolicyPage: 'Cookie Policy',
    datasetsPage: 'Datasets',
    applicationsPage: 'Applications',
    newsPage: 'News',
    eventPage: 'Event',
    reusesPage: 'Reuses',
    sitemapPage: 'Sitemap',
    catalogApiDocPage: 'API Documentation',
    standardPage: 'Standard Page',
    link: 'Link'
  },
  fr: {
    homePage: 'Accueil',
    contactPage: 'Contact',
    accessibilityPage: 'Accessibilité',
    termsOfServicePage: "Conditions générales d'utilisation",
    legalNoticePage: 'Mentions légales',
    privacyPolicyPage: 'Politique de confidentialité',
    cookiePolicyPage: 'Politique de cookies',
    datasetsPage: 'Catalogue de données',
    applicationsPage: 'Catalogue de visualisations',
    newsPage: 'Actualités',
    eventPage: 'Événement',
    reusesPage: 'Réutilisations',
    sitemapPage: 'Plan du site',
    catalogApiDocPage: "Documentation d'API",
    standardPage: 'Page standard',
    link: 'Lien'
  }
}
