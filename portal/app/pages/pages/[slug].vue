<template>
  <page-elements
    v-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />

  <h1 class="text-h4">Page config</h1>
  <pre>{{ pageConfigFetch.data.value }}</pre>
</template>

<script setup lang="ts">
import type { ImageRef, PageConfig } from '#api/types/page'

const route = useRoute()
const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/' + route.params.slug, { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/${route.params.slug}/images/${id}`
})
</script>
