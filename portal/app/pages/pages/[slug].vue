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
const slug = route.params.slug as string

const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
providePageImageSrc('generic', slug)

// Les pages génériques sans groupe (type='generic', pas de config.group)
const pageConfigFetch = await useFetch<PageConfig>(`/portal/api/pages/generic/${slug}`, {
  watch: false
})

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setBreadcrumbs([
    { title: pageConfig?.title || portalConfig.value.title }
  ])
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

usePageSeo({
  title: () => pageConfigFetch.data.value?.title
    ? `${pageConfigFetch.data.value.title} - ${portalConfig.value.title}`
    : portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description
})
</script>
