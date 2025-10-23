<template>
  <page-elements
    v-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { PageConfig } from '#api/types/page'

definePageMeta({ layout: 'home' })
const { portalConfig } = usePortalStore()
const pageConfigFetch = await useLocalFetch<PageConfig>('/portal/api/pages/home/home', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/home/home/images/${id}`
})

// Meta from portal config, not home page config
usePageSeo({
  title: portalConfig.value.title,
  description: portalConfig.value.description
})

</script>
