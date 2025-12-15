<template>
  <LayoutAppBar
    v-if="!isIframe"
    :home="true"
  />
  <v-main :style="`position: relative; padding-top: ${headerPadding}px;`">
    <LayoutBreadcrumbs
      v-if="!isIframe && (portalConfig.breadcrumb.position === 'below-nav' || portalConfig.breadcrumb.position === 'both')"
    />
    <v-container class="container">
      <slot />
    </v-container>
  </v-main>
  <!-- Do not put bottom breadcrumbs in main, ensuring they stay just above the footer even when main content is short. -->
  <LayoutBreadcrumbs
    v-if="!isIframe && (portalConfig.breadcrumb.position === 'above-footer' || portalConfig.breadcrumb.position === 'both')"
  />
  <LayoutFooter v-if="!isIframe" />
  <LayoutScrollToTop v-if="!isIframe" />
</template>

<script setup lang="ts">
const { portalConfig } = usePortalStore()

// Detect if the page is displayed in an iframe via the Sec-Fetch-Dest header
// useState allows sharing the value between server and client
const isIframe = useState('isIframe', () => {
  if (import.meta.server) {
    const headers = useRequestHeaders()
    return headers['sec-fetch-dest'] === 'iframe'
  }
  return false
})

// prevent a weird bug with the css var --v-layout-top that changes when we scroll while it shouldn't
const headerPadding = computed(() => {
  if (isIframe.value) return 0
  const showHeader = portalConfig.value.headerHomeActive ? portalConfig.value.headerHome?.show : portalConfig.value.header.show
  return 64 + (showHeader ? 128 : 0)
})
</script>
