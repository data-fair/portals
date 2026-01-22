<template>
  <LayoutAppBar
    v-if="!isIframe"
    :home="true"
  />
  <v-main :style="`position: relative; padding-top: ${headerPadding}px;`">
    <v-container class="container">
      <slot />
    </v-container>
  </v-main>
  <LayoutFooter v-if="!isIframe" />
  <LayoutScrollToTop v-if="!isIframe" />
</template>

<script setup lang="ts">
const { portalConfig } = usePortalStore()
const { isIframe } = useNavigationStore()

// prevent a weird bug with the css var --v-layout-top that changes when we scroll while it shouldn't
const headerPadding = computed(() => {
  if (isIframe.value) return 0
  const showHeader = portalConfig.value.headerHomeActive ? portalConfig.value.headerHome?.show : portalConfig.value.header.show
  return 64 + (showHeader ? 128 : 0)
})
</script>
