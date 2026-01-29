<template>
  <tracking-consent v-if="!privacyPolicyExist && !cookiePolicyExist" />

  <!-- Error state -->
  <page-error
    v-if="pageConfigFetch.error.value"
    :status-code="pageConfigFetch.error.value.statusCode || 500"
  />

  <page-elements
    v-else-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page'

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
providePageImageSrc('legal-notice')

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/legal-notice/legal-notice', { watch: false })
const standardPagesFetch = await useFetch<Record<string, boolean>>('/portal/api/pages/standard-exists', { watch: false })
const privacyPolicyExist = computed(() => standardPagesFetch.data.value?.['privacy-policy'])
const cookiePolicyExist = computed(() => standardPagesFetch.data.value?.['cookie-policy'])

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setBreadcrumbs([{ type: 'standard', subtype: 'legal-notice', title: pageConfig?.title }])
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('legalNotice')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description
})
</script>

<i18n lang="yaml">
  en:
    legalNotice: Legal Notice
  fr:
    legalNotice: Mentions légales
</i18n>
