<template>
  <div>
    HELLO {{ $portalConfig }}
    <v-img v-if="$portalConfig.logo" :src="getImageSrc($portalConfig.logo, true)" />
  </div>

</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/page-elements'

definePageMeta({ layout: 'home' })

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!
</script>
