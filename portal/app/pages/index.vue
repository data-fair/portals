<template>
  <layout-page :is-fluid="pageConfigFetch.data.value?.fluid">
    <page-elements
      v-if="pageConfigFetch.data.value"
      :model-value="pageConfigFetch.data.value.elements"
    />
  </layout-page>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page'

const { portalConfig } = usePortalStore()
const { clearBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
providePageImageSrc('home')
setShowBreadcrumbs(false) // Home page does not show breadcrumbs

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/home/home', { watch: false })
provide('page-config', pageConfigFetch.data)

watch(() => pageConfigFetch.data.value, () => {
  clearBreadcrumbs()
}, { immediate: true })

// Meta from portal config, not home page config
usePageSeo({
  title: portalConfig.value.title,
  description: pageConfigFetch.data.value?.description || portalConfig.value.description
})

</script>
