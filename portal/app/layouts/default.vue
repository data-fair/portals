<template>
  <LayoutAppBar v-if="!isIframe" />
  <v-main :style="`position: relative; padding-top: ${headerPadding}px;`">
    <LayoutBreadcrumbs v-if="showBreadcrumbs('top')" />
    <v-container :class="['container', { 'pt-0': showBreadcrumbs('top') }]">
      <slot />
    </v-container>
  </v-main>

  <!-- Do not put bottom breadcrumbs in main, ensuring they stay just above the footer even when main content is short. -->
  <LayoutBreadcrumbs v-if="showBreadcrumbs('bottom')" />
  <LayoutFooter v-if="!isIframe" />
  <LayoutScrollToTop v-if="!isIframe" />
</template>

<script setup lang="ts">
const { portalConfig } = usePortalStore()
const { isIframe, showBreadcrumbs } = useNavigationStore()

// prevent a weird bug with the css var --v-layout-top that changes when we scroll while it shouldn't
const headerPadding = computed(() => {
  if (isIframe.value) return 0
  return 64 + (portalConfig.value.header.show ? 128 : 0)
})
</script>
