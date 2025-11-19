<template>
  <v-container>
    <h1 class="text-h3 mb-6">
      {{ t('sitemap') }}
    </h1>

    <ul style="list-style: none;">
      <!-- Home always first -->
      <li v-if="!allInternalPaths.has('/')" class="mb-2">
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

      <!-- Contact and Privacy Policy in last -->
      <li v-if="contactExists && !allInternalPaths.has('/contact')">
        <NuxtLink to="/contact">{{ t('contact') }}</NuxtLink>
      </li>
      <li v-if="privacyPolicyExists && !allInternalPaths.has('/privacy-policy')">
        <NuxtLink to="/privacy-policy">{{ t('privacyPolicy') }}</NuxtLink>
      </li>
    </ul>
  </v-container>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page'
import type { MenuItem, LinkItem } from '#api/types/portal'

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { resolveLink, setBreadcrumbs } = useNavigationStore()

// Check if contact / privacy policy page exists
const contactFetch = await useLocalFetch<PageConfig>('/portal/api/pages/contact/contact', { watch: false })
const contactExists = computed(() => !!contactFetch.data.value && !contactFetch.error.value)
const privacyPolicyFetch = await useLocalFetch<PageConfig>('/portal/api/pages/privacy-policy/privacy-policy', { watch: false })
const privacyPolicyExists = computed(() => !!privacyPolicyFetch.data.value && !privacyPolicyFetch.error.value)

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

// Filter to get only internal items
const filterInternalItems = (items: (MenuItem | LinkItem)[]): (MenuItem | LinkItem)[] => {
  return items.filter(item => {
    if (item.type === 'submenu' && 'children' in item && item.children) {
      return filterInternalItems(item.children).length > 0
    }
    return item.type !== 'external'
  }).map(item => {
    if (item.type === 'submenu' && 'children' in item && item.children) {
      return { ...item, children: filterInternalItems(item.children) }
    }
    return item
  })
}

const internalNavigationItems = computed(() => filterInternalItems(portalConfig.value.menu.children))
const internalFooterLinks = computed(() => filterInternalItems(portalConfig.value.footer.links || []))
const internalFooterImportantLinks = computed(() => filterInternalItems(portalConfig.value.footer.importantLinks || []))

// All internal paths (to avoid duplicates)
const allInternalPaths = computed(() => {
  const paths = new Set<string>()
  paths.add('/') // Always add home
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
    home: Home
    contact: Contact
    privacyPolicy: Privacy Policy
  fr:
    sitemap: Plan du site
    description: Découvrez la structure complète du site et accédez directement aux pages de jeux de données, de visualisations, d'événements et d'actualités.
    home: Accueil
    contact: Contact
    privacyPolicy: Politique de confidentialité
</i18n>
