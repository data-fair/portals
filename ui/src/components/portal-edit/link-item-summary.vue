<template>
  <v-icon
    v-if="item.icon && (item.icon.mdi?.svgPath || item.icon.custom)"
    :icon="item.icon.mdi?.svgPath || item.icon.custom"
    size="small"
    class="mr-1"
  />
  <span v-if="item.type === 'standard'">
    {{ t(standardPageLabel) }}<template v-if="item.title"> - {{ t('label') }} : {{ item.title }}</template>
  </span>
  <span v-else-if="item.type === 'event'">
    {{ t('event') }}<template v-if="item.pageRef?.title"> - {{ item.pageRef.title }}</template><template
      v-if="item.title"
    > - {{ t('label') }} : {{ item.title }}</template>
  </span>
  <span v-else-if="item.type === 'news'">
    {{ t('news') }}<template v-if="item.pageRef?.title"> - {{ item.pageRef.title }}</template><template
      v-if="item.title"
    > - {{ t('label') }} : {{ item.title }}</template>
  </span>
  <span v-else-if="item.type === 'generic'">
    {{ t('customPage') }}<template v-if="item.pageRef?.title"> - {{ item.pageRef.title }}</template><template
      v-if="item.title"
    > - {{ t('label') }} : {{ item.title }}</template>
  </span>
  <span v-else-if="item.type === 'external'">
    {{ t('externalLink') }} - {{ t('label') }} : {{ item.title }} - {{ t('url') }} : {{ item.href }}<template
      v-if="item.target"
    > - {{ t('openNewTab') }}</template>
  </span>
  <span v-else-if="item.type === 'submenu'">
    {{ t('submenu') }} - {{ t('label') }} : {{ item.title }}
  </span>
  <span v-else>
    {{ t('notConfigured') }}
  </span>
</template>

<script lang="ts" setup>
import type { MenuItem, LinkItem } from '#api/types/portal'

const props = defineProps<{
  item: MenuItem | LinkItem
}>()

const { t } = useI18n()

const standardPageLabel = computed(() => {
  if (props.item.type !== 'standard' || !props.item.subtype) return 'standardPage'

  const labelKeys: Record<string, string> = {
    home: 'homePage',
    contact: 'contactPage',
    accessibility: 'accessibilityPage',
    'terms-of-service': 'termsOfServicePage',
    'legal-notice': 'legalNoticePage',
    'privacy-policy': 'privacyPolicyPage',
    'cookie-policy': 'cookiePolicyPage',
    datasets: 'datasetsCatalog',
    applications: 'applicationsCatalog',
    reuses: 'reusesCatalog',
    event: 'eventCatalog',
    news: 'newsCatalog',
    sitemap: 'sitemap',
    'catalog-api-doc': 'catalogApiDocPage'
  }

  return labelKeys[props.item.subtype] || 'standardPage'
})
</script>

<i18n lang="yaml">
  en:
    label: Label
    url: URL
    openNewTab: Opens in a new tab
    homePage: Home page
    contactPage: Contact page
    accessibilityPage: Accessibility page
    termsOfServicePage: Terms of service page
    legalNoticePage: Legal notice page
    privacyPolicyPage: Privacy policy page
    cookiePolicyPage: Cookie policy page
    datasetsCatalog: Datasets catalog
    applicationsCatalog: Applications catalog
    eventCatalog: Event catalog
    newsCatalog: News catalog
    sitemap: Sitemap
    catalogApiDocPage: API Documentation
    standardPage: Standard page
    event: Event
    news: News
    customPage: Custom page
    externalLink: Link
    submenu: Submenu
    notConfigured: Link not configured

  fr:
    label: Libellé
    url: URL
    openNewTab: S'ouvre dans un nouvel onglet
    homePage: Page d'accueil
    contactPage: Page de contact
    accessibilityPage: Page d'accessibilité
    termsOfServicePage: Page de conditions générales d'utilisation
    legalNoticePage: Page de mentions légales
    privacyPolicyPage: Page de politique de confidentialité
    cookiePolicyPage: Page de politique de cookies
    datasetsCatalog: Catalogue de données
    applicationsCatalog: Catalogue de visualisations
    eventCatalog: Catalogue d'événements
    newsCatalog: Catalogue d'actualités
    sitemap: Plan du site
    catalogApiDocPage: Documentation d'API
    standardPage: Page standard
    event: Événement
    news: Actualité
    customPage: Page éditée
    externalLink: Lien
    submenu: Sous-menu
    notConfigured: Lien non configuré

</i18n>
