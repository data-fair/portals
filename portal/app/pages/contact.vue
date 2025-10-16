<template>
  <page-elements
    v-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />
</template>

<script setup lang="ts">
import type { ImageRef, PageConfig } from '#api/types/page'

const { portalConfig } = usePortalStore()
const pageConfigFetch = await useLocalFetch<PageConfig>('/portal/api/pages/contact/contact', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/contact/contact/images/${id}`
})

const title = computed(() => (pageConfigFetch.data.value?.title || 'Contact') + ' - ' + portalConfig.value.title)
const description = computed(() => pageConfigFetch.data.value?.description || portalConfig.value.description)
useSeoMeta({
  title: title.value,
  description: description.value,
  ogTitle: title.value,
  ogDescription: description.value,
  ogType: 'website'
})

</script>
