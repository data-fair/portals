<template>
  <page-elements
    v-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page'

definePageMeta({ layout: 'home' })
const { portalConfig } = usePortalStore()
const { clearBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
providePageImageSrc('home')

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/home/home', { watch: false })

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  clearBreadcrumbs()
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

// Meta from portal config, not home page config
usePageSeo({
  title: portalConfig.value.title,
  description: pageConfigFetch.data.value?.description || portalConfig.value.description
})

</script>
