<template>
  <LayoutAppBar
    v-if="!isIframe"
    :home="isHome"
  />
  <v-main :style="`position: relative; padding-top: ${headerPadding}px;`">
    <LayoutBreadcrumbs v-if="!isHome && showBreadcrumbs('top')" />
    <v-container
      :class="{
        'container': !isFluid,
        'pt-0': showBreadcrumbs('top')
      }"
      fluid
    >
      <slot />
    </v-container>
  </v-main>

  <!-- Do not put bottom breadcrumbs in main, ensuring they stay just above the footer even when main content is short. -->
  <LayoutBreadcrumbs v-if="!isHome && showBreadcrumbs('bottom')" />
  <LayoutFooter v-if="!isIframe" />
  <LayoutScrollToTop v-if="!isIframe" />
</template>

<script setup lang="ts">

const { isHome, isFluid } = defineProps<{
  isHome: boolean
  isFluid: boolean
}>()

const { portalConfig } = usePortalStore()
const { isIframe, showBreadcrumbs } = useNavigationStore()

// prevent a weird bug with the css var --v-layout-top that changes when we scroll while it shouldn't
const headerPadding = computed(() => {
  if (isIframe.value) return 0
  const showHeader = (isHome && portalConfig.value.headerHomeActive) ? portalConfig.value.headerHome?.show : portalConfig.value.header.show
  return 64 + (showHeader ? 128 : 0)
})
</script>
