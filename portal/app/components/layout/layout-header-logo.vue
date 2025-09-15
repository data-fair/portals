<template>
  <!-- External Link -->
  <a
    v-if="link"
    :href="link"
    :title="t('openInNewTab')"
    target="_blank"
    rel="noopener noreferrer"
    class="d-flex align-center"
  >
    <img
      :src="getImageSrc(logo, false)"
      :height="height || 80"
    >
  </a>

  <!-- Link to Home -->
  <NuxtLink
    v-else-if="!isSecondary"
    :title="t('home')"
    to="/"
    class="d-flex align-center"
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

const { t } = useI18n()

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!

</script>

<i18n lang="yaml">
  en:
    home: 'Go to Home'
    openInNewTab: 'Open in a new tab'

  fr:
    home: "Aller à l'accueil"
    openInNewTab: 'Ouvrir dans un nouvel onglet'

</i18n>
