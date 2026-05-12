<template>
  <layout-page>
    <v-container>
      <h1 class="text-headline-large text-primary mb-2">
        {{ t('sitemap') }}
      </h1>
      <p class="text-body-large text-medium-emphasis mb-6">
        {{ t('description') }}
      </p>

      <section
        v-if="hasMainNavSection"
        class="mb-6"
        aria-labelledby="sitemap-nav-title"
      >
        <h2
          id="sitemap-nav-title"
          class="text-title-large text-primary mb-3"
        >
          {{ t('sitemapSections.mainNav') }}
        </h2>
        <ul style="list-style: none; padding-left: 0;">
          <li
            v-if="!allInternalPaths.has('/')"
            class="mb-2"
          >
            <NuxtLink to="/">{{ t('home') }}</NuxtLink>
          </li>
          <sitemap-menu-item
            v-for="(item, i) in internalNavigationItems"
            :key="`nav-${i}`"
            :item="item"
          />
        </ul>
      </section>

      <section
        v-if="hasServicesSection"
        class="mb-6"
        aria-labelledby="sitemap-services-title"
      >
        <h2
          id="sitemap-services-title"
          class="text-title-large text-primary mb-3"
        >
          {{ t('sitemapSections.services') }}
        </h2>
        <ul style="list-style: none; padding-left: 0;">
          <li
            v-if="!session.user.value"
            class="mb-2"
          >
            <a :href="session.loginUrl()">{{ t('login') }}</a>
          </li>
          <li
            v-if="standardPages['datasets'] && !allInternalPaths.has('/datasets')"
            class="mb-2"
          >
            <NuxtLink to="/datasets">{{ t('datasets') }}</NuxtLink>
          </li>
          <li
            v-if="standardPages['applications'] && !allInternalPaths.has('/applications')"
            class="mb-2"
          >
            <NuxtLink to="/applications">{{ t('applications') }}</NuxtLink>
          </li>
          <li
            v-if="standardPages['reuses'] && !allInternalPaths.has('/reuses')"
            class="mb-2"
          >
            <NuxtLink to="/reuses">{{ t('reuses') }}</NuxtLink>
          </li>
        </ul>
      </section>

      <section
        v-if="hasLegalSection"
        class="mb-6"
        aria-labelledby="sitemap-legal-title"
      >
        <h2
          id="sitemap-legal-title"
          class="text-title-large text-primary mb-3"
        >
          {{ t('sitemapSections.legal') }}
        </h2>
        <ul style="list-style: none; padding-left: 0;">
          <sitemap-menu-item
            v-for="(item, i) in internalFooterLinks"
            :key="`footer-${i}`"
            :item="item"
          />
          <sitemap-menu-item
            v-for="(item, i) in internalFooterImportantLinks"
            :key="`footer-important-${i}`"
            :item="item"
          />
          <li
            v-if="standardPages.contact && !allInternalPaths.has('/contact')"
            class="mb-2"
          >
            <NuxtLink to="/contact">{{ t('contact') }}</NuxtLink>
          </li>
          <li
            v-if="standardPages.accessibility && !allInternalPaths.has('/accessibility')"
            class="mb-2"
          >
            <NuxtLink to="/accessibility">{{ t('accessibility') }}</NuxtLink>
          </li>
          <li
            v-if="standardPages['terms-of-service'] && !allInternalPaths.has('/terms-of-service')"
            class="mb-2"
          >
            <NuxtLink to="/terms-of-service">{{ t('termsOfService') }}</NuxtLink>
          </li>
          <li
            v-if="standardPages['legal-notice'] && !allInternalPaths.has('/legal-notice')"
            class="mb-2"
          >
            <NuxtLink to="/legal-notice">{{ t('legalNotice') }}</NuxtLink>
          </li>
          <li
            v-if="standardPages['privacy-policy'] && !allInternalPaths.has('/privacy-policy')"
            class="mb-2"
          >
            <NuxtLink to="/privacy-policy">{{ t('privacyPolicy') }}</NuxtLink>
          </li>
          <li
            v-if="standardPages['cookie-policy'] && !allInternalPaths.has('/cookie-policy')"
            class="mb-2"
          >
            <NuxtLink to="/cookie-policy">{{ t('cookiePolicy') }}</NuxtLink>
          </li>
        </ul>
      </section>
    </v-container>
  </layout-page>
</template>

<script setup lang="ts">
import type { MenuItem, LinkItem } from '#api/types/portal'

const { t } = useI18n()
const session = useSession()
const { portalConfig } = usePortalStore()
const { resolveLink, setBreadcrumbs, isExternalLink } = useNavigationStore()

// Check which standard pages exist
const standardPagesFetch = await useFetch<Record<string, boolean>>('/portal/api/pages/standard-exists', { watch: false })
const standardPages = computed(() => standardPagesFetch.data.value || {})

// Collect all internal paths recursively
const collectInternalPaths = (items: (MenuItem | LinkItem)[]): Set<string> => {
  const paths = new Set<string>()
  const processItem = (item: MenuItem | LinkItem) => {
    if (item.type === 'submenu' && 'children' in item && item.children) {
      item.children.forEach(processItem)
    } else if (!isExternalLink(item)) {
      const path = resolveLink(item)
      if (path) paths.add(path)
    }
  }
  items.forEach(processItem)
  return paths
}

// Filter to get only internal items and exclude the sitemap route
const filterInternalItems = (items: (MenuItem | LinkItem)[]): (MenuItem | LinkItem)[] => {
  const filtered = items
    .map(item => {
      if (item.type === 'submenu' && 'children' in item && item.children) {
        const children = filterInternalItems(item.children)
        if (children.length === 0) return null
        return { ...item, children }
      }
      return item
    })
    .filter(Boolean) as (MenuItem | LinkItem)[]
  // Remove external links and any links resolving to '/sitemap'
  return filtered.filter(item => {
    if (item.type === 'submenu') return true // keep submenus
    if (isExternalLink(item)) return false
    const path = resolveLink(item)
    if (!path) return false
    if (path === '/sitemap') return false
    return true
  })
}

const internalNavigationItems = computed(() => filterInternalItems(portalConfig.value.menu.children))
const internalFooterLinks = computed(() => filterInternalItems(portalConfig.value.footer.links || []))
const internalFooterImportantLinks = computed(() => filterInternalItems(portalConfig.value.footer.importantLinks || []))

// All internal paths (to avoid duplicates)
const allInternalPaths = computed(() => {
  const paths = new Set<string>()
  collectInternalPaths(portalConfig.value.menu.children).forEach(p => paths.add(p))
  if (portalConfig.value.footer.links) {
    collectInternalPaths(portalConfig.value.footer.links).forEach(p => paths.add(p))
  }
  if (portalConfig.value.footer.importantLinks) {
    collectInternalPaths(portalConfig.value.footer.importantLinks).forEach(p => paths.add(p))
  }
  return paths
})

// Section visibility (avoid orphan <h2> with empty <ul>)
const hasMainNavSection = computed(() =>
  !allInternalPaths.value.has('/') || internalNavigationItems.value.length > 0
)

const hasServicesSection = computed(() =>
  !session.user.value ||
  (standardPages.value['datasets'] && !allInternalPaths.value.has('/datasets')) ||
  (standardPages.value['applications'] && !allInternalPaths.value.has('/applications')) ||
  (standardPages.value['reuses'] && !allInternalPaths.value.has('/reuses'))
)

const hasLegalSection = computed(() =>
  internalFooterLinks.value.length > 0 ||
  internalFooterImportantLinks.value.length > 0 ||
  (standardPages.value.contact && !allInternalPaths.value.has('/contact')) ||
  (standardPages.value.accessibility && !allInternalPaths.value.has('/accessibility')) ||
  (standardPages.value['terms-of-service'] && !allInternalPaths.value.has('/terms-of-service')) ||
  (standardPages.value['legal-notice'] && !allInternalPaths.value.has('/legal-notice')) ||
  (standardPages.value['privacy-policy'] && !allInternalPaths.value.has('/privacy-policy')) ||
  (standardPages.value['cookie-policy'] && !allInternalPaths.value.has('/cookie-policy'))
)

setBreadcrumbs([{ type: 'standard', subtype: 'sitemap' }])

usePageSeo({
  title: t('sitemap') + ' - ' + portalConfig.value.title,
  description: t('description')
})
</script>

<i18n lang="yaml">
  en:
    sitemap: Sitemap
    description: Discover the complete structure of the site and directly access dataset, visualization, event, and news pages.
    datasets: Datasets
    applications: Applications
    reuses: Reuses
    home: Home
    contact: Contact
    accessibility: Accessibility
    termsOfService: Terms of Service
    legalNotice: Legal Notice
    privacyPolicy: Privacy Policy
    cookiePolicy: Cookie Policy
    login: Login Page
    sitemapSections:
      mainNav: Main Navigation
      services: Data & Services
      legal: Legal & Informational Links
  fr:
    sitemap: Plan du site
    description: Découvrez la structure complète du site et accédez directement aux pages de jeux de données, de visualisations, d'événements et d'actualités.
    datasets: Jeux de données
    applications: Visualisations
    reuses: Réutilisations
    home: Accueil
    contact: Contact
    accessibility: Accessibilité
    termsOfService: Conditions générales d'utilisation
    legalNotice: Mentions légales
    privacyPolicy: Politique de confidentialité
    cookiePolicy: Politique de cookies
    login: Page de connexion
    sitemapSections:
      mainNav: Navigation principale
      services: Services et données
      legal: Informations légales et contact
</i18n>
