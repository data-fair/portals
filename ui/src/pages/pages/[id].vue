<template>
  <router-view />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/page'
import { providePageStore } from '~/composables/use-page-store'
const route = useRoute<'/pages/[id]'>()
providePageStore(route.params.id)

provide('page-id', route.params.id)
provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return $apiPath + '/images/' + id + '/data'
})

</script>
