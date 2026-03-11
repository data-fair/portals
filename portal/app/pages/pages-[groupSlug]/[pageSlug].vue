<template>
  <layout-page :is-fluid="pageConfigFetch.data.value?.fluid">
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

const route = useRoute<'/pages/pages-[groupSlug]/[pageSlug]'>()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
const getPageImageSrc = providePageImageSrc('generic', route.params.pageSlug as string)

const pageConfigFetch = await useFetch<PageConfig>(`/portal/api/pages/generic/${route.params.pageSlug}`, { watch: false })
provide('page-config', pageConfigFetch.data)

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
  description: () => pageConfigFetch.data.value?.description,
  ogImage: () => pageConfigFetch.data.value?.thumbnail ? getPageImageSrc(pageConfigFetch.data.value.thumbnail) : undefined
})

useJsonLd(() => {
  const pageConfig = pageConfigFetch.data.value
  if (!pageConfig) return []
  const base = useRequestURL()

  return createWebPageSchema({
    id: base.href,
    title: pageConfig.title,
    description: pageConfig.description,
    url: base.href
  })
})
</script>
