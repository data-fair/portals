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
const { setBreadcrumbs, setShowBreadcrumbs, setActivePageGroup } = useNavigationStore()
const getPageImageSrc = providePageImageSrc('generic', route.params.pageSlug as string)

const pageConfigFetch = await useFetch<PageConfig>(`/portal/api/pages/generic/${route.params.pageSlug}`, { watch: false })
provide('page-config', pageConfigFetch.data)

// The page also answers without its group or under another one: all these URLs point to its group URL
const groupSlug = pageConfigFetch.data.value?.genericMetadata?.group?.slug
const pagePath = `/pages${groupSlug ? `-${groupSlug}` : ''}/${route.params.pageSlug}`

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  // Breadcrumbs with group if available, linking to its root page when defined
  const group = pageConfig?.genericMetadata?.group
  setBreadcrumbs([
    ...(group?.title ? [{ title: group.title, to: group.rootPage ? `/pages/${group.rootPage}` : undefined }] : []),
    { title: pageConfig?.title || portalConfig.value.title }
  ])
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
  // Let the nav bar highlight the tab pointing at this group's root page
  setActivePageGroup(group)
}, { immediate: true })

usePageSeo({
  title: () => pageConfigFetch.data.value?.title
    ? `${pageConfigFetch.data.value.title} - ${portalConfig.value.title}`
    : portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description,
  ogImage: () => pageConfigFetch.data.value?.thumbnail ? getPageImageSrc(pageConfigFetch.data.value.thumbnail) : undefined,
  canonicalPath: pagePath
})

useJsonLd(() => {
  const pageConfig = pageConfigFetch.data.value
  if (!pageConfig) return []
  const url = useRequestURL().origin + pagePath

  return createWebPageSchema({
    id: url,
    title: pageConfig.title,
    description: pageConfig.description,
    url
  })
})
</script>
