<template>
  <router-view />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import { provideReuseStore } from '~/composables/use-reuse-store'
const route = useRoute<'/reuses/[id]'>()
provideReuseStore(route.params.id)

provide('reuse-id', route.params.id)
provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return $apiPath + '/images/' + id + '/data'
})

</script>
