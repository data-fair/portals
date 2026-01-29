<template>
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

const route = useRoute()
const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
providePageImageSrc('accessibility')

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/accessibility/accessibility', { watch: false })

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setBreadcrumbs([{ type: 'standard', subtype: 'accessibility', title: pageConfig?.title }])
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
  route.meta.isFluid = pageConfig?.fluid
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('accessibility')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description
})
</script>

<i18n lang="yaml">
  en:
    accessibility: Accessibility
  fr:
    accessibility: Accessibilité
</i18n>
