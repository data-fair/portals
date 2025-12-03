<template>
  <router-view />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import { provideUseStore } from '~/composables/use-use-store'
const route = useRoute<'/uses/[id]'>()
provideUseStore(route.params.id)

provide('use-id', route.params.id)
provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return $apiPath + '/images/' + id + '/data'
})

</script>
