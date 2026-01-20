<template>
  <v-container>
    <h1 class="text-h3 text-primary mb-6">
      {{ t('sitemap') }}
    </h1>

    <ul style="list-style: none;">
      <!-- Home always first -->
      <li
        v-if="!allInternalPaths.has('/')"
        class="mb-2"
      >
        <NuxtLink to="/">{{ t('home') }}</NuxtLink>
      </li>

      <!-- Navigation menu items -->
      <sitemap-menu-item
        v-for="(item, i) in internalNavigationItems"
        :key="`nav-${i}`"
        :item="item"
      />

      <!-- Footer links -->
      <sitemap-menu-item
        v-for="(item, i) in internalFooterLinks"
        :key="`footer-${i}`"
        :item="item"
      />

      <!-- Footer important links -->
      <sitemap-menu-item
        v-for="(item, i) in internalFooterImportantLinks"
        :key="`footer-important-${i}`"
        :item="item"
      />

      <!-- Login page (only if not authenticated) -->
      <li v-if="!session.user.value">
        <a :href="session.loginUrl()">{{ t('login') }}</a>
      </li>

      <!-- Standard pages at the end -->
      <li v-if="standardPages['applications'] && !allInternalPaths.has('/applications')">
        <NuxtLink to="/applications">{{ t('applications') }}</NuxtLink>
      </li>
      <li v-if="standardPages['datasets'] && !allInternalPaths.has('/datasets')">
        <NuxtLink to="/datasets">{{ t('datasets') }}</NuxtLink>
      </li>
      <li v-if="standardPages.contact && !allInternalPaths.has('/contact')">
        <NuxtLink to="/contact">{{ t('contact') }}</NuxtLink>
      </li>
      <li v-if="standardPages['privacy-policy'] && !allInternalPaths.has('/privacy-policy')">
        <NuxtLink to="/privacy-policy">{{ t('privacyPolicy') }}</NuxtLink>
      </li>
      <li v-if="standardPages.accessibility && !allInternalPaths.has('/accessibility')">
        <NuxtLink to="/accessibility">{{ t('accessibility') }}</NuxtLink>
      </li>
      <li v-if="standardPages['legal-notice'] && !allInternalPaths.has('/legal-notice')">
        <NuxtLink to="/legal-notice">{{ t('legalNotice') }}</NuxtLink>
      </li>
      <li v-if="standardPages['cookie-policy'] && !allInternalPaths.has('/cookie-policy')">
        <NuxtLink to="/cookie-policy">{{ t('cookiePolicy') }}</NuxtLink>
      </li>
      <li v-if="standardPages['terms-of-service'] && !allInternalPaths.has('/terms-of-service')">
        <NuxtLink to="/terms-of-service">{{ t('termsOfService') }}</NuxtLink>
      </li>
    </ul>
  </v-container>
</template>

<script setup lang="ts">
import type { MenuItem, LinkItem } from '#api/types/portal'

const { t } = useI18n()
const session = useSession()
const { portalConfig } = usePortalStore()
const { resolveLink, setBreadcrumbs } = useNavigationStore()

// Check which standard pages exist
const standardPagesFetch = await useFetch<Record<string, boolean>>('/portal/api/pages/standard-exists', { watch: false })
const standardPages = computed(() => standardPagesFetch.data.value || {})

// Collect all internal paths recursively
const collectInternalPaths = (items: (MenuItem | LinkItem)[]): Set<string> => {
  const paths = new Set<string>()

  const processItem = (item: MenuItem | LinkItem) => {
    if (item.type === 'submenu' && 'children' in item && item.children) {
      item.children.forEach(processItem)
    } else if (item.type !== 'external') {
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
    if (item.type === 'external') return false
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

setBreadcrumbs([
  { type: 'standard', subtype: 'sitemap' }
])

usePageSeo({
  title: t('sitemap') + ' - ' + portalConfig.value.title,
  description: t('description')
})
</script>

<i18n lang="yaml">
  en:
    sitemap: Sitemap
    description: Discover the complete structure of the site and directly access dataset, visualization, event, and news pages.
    applications: Applications
    datasets: Datasets
    home: Home
    contact: Contact
    privacyPolicy: Privacy Policy
    accessibility: Accessibility
    legalNotice: Legal Notice
    cookiePolicy: Cookie Policy
    termsOfService: Terms of Service
    login: Login Page
  fr:
    sitemap: Plan du site
    description: Découvrez la structure complète du site et accédez directement aux pages de jeux de données, de visualisations, d'événements et d'actualités.
    applications: Visualisations
    datasets: Jeux de données
    home: Accueil
    contact: Contact
    privacyPolicy: Politique de confidentialité
    accessibility: Accessibilité
    legalNotice: Mentions légales
    cookiePolicy: Politique de cookies
    termsOfService: Conditions générales d'utilisation
    login: Page de connexion
</i18n>
