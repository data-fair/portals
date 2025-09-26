<template>
  <h1>PortalConfig</h1>
  <pre>{{ portalConfig }}</pre>
  <v-img v-if="portalConfig.logo" :src="getImageSrc(portalConfig.logo, true)" />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/page-elements'

definePageMeta({ layout: 'home' })
const { portalConfig } = usePortalStore()

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!

useSeoMeta({
  title: portalConfig.value.title,
  description: portalConfig.value.description,
  ogTitle: portalConfig.value.title,
  ogDescription: portalConfig.value.description,
  ogType: 'website',
})

</script>
