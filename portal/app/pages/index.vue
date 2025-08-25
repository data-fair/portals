<template>
  <div>
    HELLO {{ $portalConfig }}
    <v-img v-if="$portalConfig.logo" :src="getImageSrc($portalConfig.logo, true)" />
  </div>

</template>

<script setup lang="ts">
import type { ImageRef } from '../../../api/types/page-elements'

definePageMeta({ layout: 'home' })

const getImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}
</script>
