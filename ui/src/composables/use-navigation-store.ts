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
    case 'event': return link.pageRef?.title || i18n[lang]['eventPage']
    case 'news': return link.pageRef?.title || i18n[lang]['newsPage']
    case 'generic': return link.pageRef?.title || i18n[lang]['customPage']
    case 'external': return link.title || i18n[lang]['externalLink']
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
    homePage: 'Home Page',
    contactPage: 'Contact Page',
    privacyPolicyPage: 'Privacy Policy Page',
    datasetsPage: 'Datasets Page',
    applicationsPage: 'Applications Page',
    newsPage: 'News Page',
    eventPage: 'Event Page',
    sitemapPage: 'Sitemap Page',
    standardPage: 'Standard Page',
    customPage: 'Custom Page',
    externalLink: 'External Link',
    link: 'Link'
  },
  fr: {
    homePage: 'Page d\'accueil',
    contactPage: 'Page de contact',
    privacyPolicyPage: 'Page de politique de confidentialité',
    datasetsPage: 'Page des jeux de données',
    applicationsPage: 'Page des applications',
    newsPage: 'Page des actualités',
    eventPage: 'Page d\'événement',
    sitemapPage: 'Page du plan du site',
    standardPage: 'Page standard',
    customPage: 'Page personnalisée',
    externalLink: 'Lien externe',
    link: 'Lien'
  }
}
