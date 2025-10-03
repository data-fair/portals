<template>
  <page-elements
    v-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />
</template>

<script setup lang="ts">
import type { ImageRef, PageConfig } from '#api/types/page'

const { portalConfig } = usePortalStore()
const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/privacy-policy/privacy-policy', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/privacy-policy/privacy-policy/images/${id}`
})

useSeoMeta({
  title: `Politique de confidentialité - ${portalConfig.value.title}`,
  description: portalConfig.value.description,
  ogTitle: `Politique de confidentialité - ${portalConfig.value.title}`,
  ogDescription: portalConfig.value.description,
  ogType: 'website'
})
</script>
