<template>
  <page-elements
    v-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />
</template>

<script setup lang="ts">
import type { ImageRef, PageConfig } from '#api/types/page'

definePageMeta({ layout: 'home' })
const { portalConfig } = usePortalStore()
const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/home/home', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/home/home/images/${id}`
})

useSeoMeta({
  title: portalConfig.value.title,
  description: portalConfig.value.description,
  ogTitle: portalConfig.value.title,
  ogDescription: portalConfig.value.description,
  ogType: 'website'
})

</script>
