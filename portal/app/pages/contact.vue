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

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
providePageImageSrc('contact')

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/contact/contact', { watch: false })

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setBreadcrumbs([{ type: 'standard', subtype: 'contact', title: pageConfig?.title }])
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('contact')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description
})

</script>

<i18n lang="yaml">
  en:
    contact: Contact
  fr:
    contact: Contact
</i18n>
