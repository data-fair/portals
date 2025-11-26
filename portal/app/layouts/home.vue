<template>
  <LayoutAppBar :home="true" />
  <v-main :style="`position: relative; padding-top: ${headerPadding}px;`">
    <layout-breadcrumbs
      v-if="portalConfig.breadcrumb.position === 'below-nav' || portalConfig.breadcrumb.position === 'both'"
    />
    <v-container class="container">
      <slot />
    </v-container>
  </v-main>
  <layout-breadcrumbs
    v-if="portalConfig.breadcrumb.position === 'above-footer' || portalConfig.breadcrumb.position === 'both'"
  />
  <LayoutFooter />
  <LayoutScrollToTop />
</template>

<script setup lang="ts">
const { portalConfig } = usePortalStore()
// prevent a weird bug with the css var --v-layout-top that changes when we scroll while it shouldn't
const headerPadding = computed(() => {
  const showHeader = portalConfig.value.headerHomeActive ? portalConfig.value.headerHome?.show : portalConfig.value.header.show
  return 64 + (showHeader ? 128 : 0)
})
</script>
