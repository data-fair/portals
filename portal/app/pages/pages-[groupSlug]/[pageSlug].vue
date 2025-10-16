<template>
  <page-elements
    v-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />
</template>

<script setup lang="ts">
import type { ImageRef, PageConfig } from '#api/types/page'

const route = useRoute<'/pages/pages-[groupSlug]/[pageSlug]'>()

const { portalConfig } = usePortalStore()
const pageConfigFetch = await useFetch<PageConfig>(`/portal/api/pages/generic/${route.params.pageSlug}`, { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/generic/${route.params.pageSlug}/images/${id}`
})

usePageSeo({
  title: () => pageConfigFetch.data.value?.title
    ? `${pageConfigFetch.data.value.title} - ${portalConfig.value.title}`
    : portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || portalConfig.value.description
})
</script>
