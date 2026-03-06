<template>
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

</script>
