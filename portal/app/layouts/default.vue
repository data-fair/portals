<template>
  <LayoutAppBar />
  <v-main :style="`position: relative; padding-top: ${headerPadding}px;`">
    <v-container class="container">
      <slot />
    </v-container>
  </v-main>
  <LayoutFooter />
  <LayoutScrollToTop />
</template>

<script setup lang="ts">
const { portalConfig } = usePortalStore()
// prevent a weird bug with the css var --v-layout-top that changes when we scroll while it shouldn't
const headerPadding = computed(() => {
  return 64 + (portalConfig.value.header.show ? 128 : 0)
})
</script>
