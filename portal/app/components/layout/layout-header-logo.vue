<template>
  <v-img
    :src="getImageSrc(logo, true)"
    :height="height || 80"
    :href="link || '/'"
    :max-width="$vuetify.display.width / 2"
    :position="isSecondary ? 'right' : 'left'"
    width="auto"
    inline
  />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/page-elements'

defineProps<{
  logo: ImageRef
  link?: string
  height?: number
  isSecondary?: boolean
}>()

const getImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}

</script>
