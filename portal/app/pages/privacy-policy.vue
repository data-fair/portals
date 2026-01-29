<template>
  <tracking-consent v-if="cookiePolicyCheck.error.value" />

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
providePageImageSrc('privacy-policy')

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/privacy-policy/privacy-policy', { watch: false })
const cookiePolicyCheck = await useFetch<PageConfig>('/portal/api/pages/cookie-policy/cookie-policy', { watch: false })

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setBreadcrumbs([{ type: 'standard', subtype: 'privacy-policy', title: pageConfig?.title }])
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('privacyPolicy')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description
})
</script>

<i18n lang="yaml">
  en:
    privacyPolicy: Privacy Policy
  fr:
    privacyPolicy: Politique de confidentialité
</i18n>
