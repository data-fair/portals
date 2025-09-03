<template>
  <!-- Lien externe -->
  <a
    v-if="link"
    :href="link"
    target="_blank"
    rel="noopener noreferrer"
    title="Ouvrir le lien"
  >
    <v-img
      :src="getImageSrc(logo, false)"
      :height="height || 80"
      :max-width="$vuetify.display.width / 2"
      :position="isSecondary ? 'right' : 'left'"
      width="auto"
      inline
    />
  </a>

  <!-- Lien vers l'accueil -->
  <NuxtLink
    v-else-if="!isSecondary"
    to="/"
    title="Aller à l'accueil"
  >
    <img
      :src="getImageSrc(logo, false)"
      :height="height || 80"
    >
  </NuxtLink>

  <img
    v-else
    :src="getImageSrc(logo, false)"
    :height="height || 80"
  >
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/page-elements'

defineProps<{
  logo: ImageRef
  link?: string
  height?: number
  isSecondary?: boolean
}>()

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!

</script>
