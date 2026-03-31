<template>
  <LayoutSkipLinks
    v-if="!isIframe"
    :targets="skipLinkTargets"
  />
  <LayoutAppBar
    v-if="!isIframe"
    :home="isHome"
  />
  <slot />
  <LayoutFooter v-if="!isIframe" />
  <LayoutScrollToTop v-if="!isIframe" />
</template>

<script setup lang="ts">

const { isIframe } = useNavigationStore()
const route = useRoute()
const isHome = computed(() => route.path === '/')

const skipLinkTargets = [
  { id: 'contenu', labelKey: 'content' },
  { id: 'header-navigation', labelKey: 'navigation' },
  { id: 'footer', labelKey: 'footer' }
]

</script>
