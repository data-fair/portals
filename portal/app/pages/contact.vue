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
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { PageConfig } from '#api/types/page'

const { portalConfig } = usePortalStore()
const pageConfigFetch = await useLocalFetch<PageConfig>('/portal/api/pages/contact/contact', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/contact/contact/images/${id}`
})

const title = computed(() => (pageConfigFetch.data.value?.title || 'Contact') + ' - ' + portalConfig.value.title)
const description = computed(() => pageConfigFetch.data.value?.description || portalConfig.value.description)
usePageSeo({
  title: title.value,
  description: description.value
})

</script>
