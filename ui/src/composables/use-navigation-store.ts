import type { LinkItem, MenuItem } from '#api/types/portal-config'

const drawer = ref(false)
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
        case 'datasets': return i18n[lang]['datasetsPage']
        case 'applications': return i18n[lang]['applicationsPage']
        case 'news': return i18n[lang]['newsPage']
        case 'event': return i18n[lang]['eventPage']
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
    drawer
  }
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
    eventPage: "Page d'événement",
    sitemapPage: 'Plan du site',
    standardPage: 'Page standard',
    link: 'Lien'
  }
}
