<template>
  <!-- External Link -->
  <a
    v-if="link"
    :title="t('openInNewTab')"
    :class="['d-flex align-center', $attrs.class]"
    :href="link"
    target="_blank"
    rel="noopener"
  >
    <img
      :alt="isSecondary ? t('imageAltSecondary') : t('imageAlt')"
      :src="getImageSrc(logo, false)"
      :height="height || 80"
    >
  </a>

  <!-- Link to Home -->
  <NuxtLink
    v-else-if="!isSecondary"
    :title="t('home')"
    to="/"
    :class="['d-flex align-center', $attrs.class]"
  >
    <img
      :alt="t('imageAlt')"
      :src="getImageSrc(logo, false)"
      :height="height || 80"
    >
  </NuxtLink>

  <img
    v-else
    :alt="isSecondary ? t('imageAltSecondary') : t('imageAlt')"
    :src="getImageSrc(logo, false)"
    :height="height || 80"
    :class="$attrs.class"
  >
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'

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
    home: Go to Home
    openInNewTab: Open in a new tab
    imageAlt: Main logo of the site
    imageAltSecondary: Secondary logo of the site

  fr:
    home: Aller à l'accueil
    openInNewTab: Ouvrir dans un nouvel onglet
    imageAlt: Logo principal du site
    imageAltSecondary: Logo secondaire du site

</i18n>
