<template>
  <layout-page :is-fluid="pageConfigFetch.data.value?.fluid">
    <tracking-consent />

    <!-- Error state -->
    <page-error
      v-if="pageConfigFetch.error.value"
      :status-code="pageConfigFetch.error.value.statusCode || 500"
    />

    <page-elements
      v-else-if="pageConfigFetch.data.value"
      :model-value="pageConfigFetch.data.value.elements"
    />
  </layout-page>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page'

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
providePageImageSrc('cookie-policy')

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/cookie-policy/cookie-policy', { watch: false })
provide('page-config', pageConfigFetch.data)

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setBreadcrumbs([{ type: 'standard', subtype: 'cookie-policy', title: pageConfig?.title }])
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('cookiePolicy')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description
})
</script>

<i18n lang="yaml">
  en:
    cookiePolicy: Cookie Policy
  fr:
    cookiePolicy: Politique de cookies
</i18n>
