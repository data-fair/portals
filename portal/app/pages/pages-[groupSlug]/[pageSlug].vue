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

const route = useRoute<'/pages/pages-[groupSlug]/[pageSlug]'>()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
providePageImageSrc('generic', route.params.pageSlug as string)

const pageConfigFetch = await useFetch<PageConfig>(`/portal/api/pages/generic/${route.params.pageSlug}`, { watch: false })

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  // Breadcrumbs with group if available
  const items = [{ title: pageConfig?.title || portalConfig.value.title }]
  if (pageConfig?.genericMetadata?.group?.title) {
    items.unshift({ title: pageConfig.genericMetadata.group.title })
  }
  setBreadcrumbs(items)
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

usePageSeo({
  title: () => pageConfigFetch.data.value?.title
    ? `${pageConfigFetch.data.value.title} - ${portalConfig.value.title}`
    : portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description
})
</script>
