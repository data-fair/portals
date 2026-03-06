<template>
  <!-- External Link -->
  <a
    v-if="link"
    :title="(isSecondary ? t('imageAltSecondary') : t('imageAlt')) + ' - ' + t('newWindow')"
    :class="['d-flex align-center', $attrs.class]"
    :href="link"
    target="_blank"
    rel="noopener"
  >
    <img
      :alt="(isSecondary ? t('imageAltSecondary') : t('imageAlt')) + ' - ' + t('newWindow')"
      :src="getPortalImageSrc(logo, false)"
      :height="height || 80"
    >
  </a>

  <!-- Link to Home -->
  <NuxtLink
    v-else-if="!isSecondary"
    :title="t('home') + ' - ' + portalConfig.title"
    :class="['d-flex align-center', $attrs.class]"
    to="/"
  >
    <img
      :alt="t('home') + ' - ' + portalConfig.title"
      :src="getPortalImageSrc(logo, false)"
      :height="height || 80"
    >
  </NuxtLink>

  <img
    v-else
    :alt="t('imageAltSecondary')"
    :src="getPortalImageSrc(logo, false)"
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
const { portalConfig } = usePortalStore()
const getPortalImageSrc = usePortalImageSrc()

</script>

<i18n lang="yaml">
  en:
    home: Home
    newWindow: New window
    imageAlt: Main logo of the site
    imageAltSecondary: Secondary logo of the site

  fr:
    home: Accueil
    newWindow: Nouvelle fenêtre
    imageAlt: Logo principal du site
    imageAltSecondary: Logo secondaire du site

</i18n>
