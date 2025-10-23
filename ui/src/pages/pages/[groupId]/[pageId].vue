<template>
  <router-view />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import { providePageStore } from '~/composables/use-page-store'
const route = useRoute<'/pages/[groupId]/[pageId]'>()
providePageStore(route.params.pageId)

provide('page-id', route.params.pageId)
provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return $apiPath + '/images/' + id + '/data'
})

</script>
