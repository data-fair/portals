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
    'privacy-policy': 'privacyPolicyPage',
    accessibility: 'accessibilityPage',
    'legal-notice': 'legalNoticePage',
    'cookie-policy': 'cookiePolicyPage',
    'terms-of-service': 'termsOfServicePage',
    datasets: 'datasetsCatalog',
    applications: 'applicationsCatalog',
    event: 'eventsList',
    news: 'newsList',
    sitemap: 'sitemap'
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
    privacyPolicyPage: Privacy policy page
    accessibilityPage: Accessibility page
    legalNoticePage: Legal notice page
    cookiePolicyPage: Cookie policy page
    termsOfServicePage: Terms of service page
    datasetsCatalog: Datasets catalog
    applicationsCatalog: Applications catalog
    eventsList: Events list
    newsList: News list
    sitemap: Sitemap
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
    privacyPolicyPage: Page de politique de confidentialité
    accessibilityPage: Page d'accessibilité
    legalNoticePage: Page de mentions légales
    cookiePolicyPage: Page de politique de cookies
    termsOfServicePage: Page de conditions générales d'utilisation
    datasetsCatalog: Catalogue de données
    applicationsCatalog: Catalogue de visualisation
    eventsList: Liste des évènements
    newsList: Liste des actualités
    sitemap: Plan du site
    standardPage: Page standard
    event: Événement
    news: Actualité
    customPage: Page éditée
    externalLink: Lien
    submenu: Sous-menu
    notConfigured: Lien non configuré

</i18n>
