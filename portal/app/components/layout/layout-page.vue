<template>
  <v-main :style="`position: relative; padding-top: ${headerPadding}px;`">
    <LayoutBreadcrumbs v-if="!isHome && showTopBreadcrumbs" />
    <v-container
      :class="{
        'container': !isFluid,
        'pt-0': showTopBreadcrumbs
      }"
    >
      <slot />
    </v-container>
  </v-main>

  <!-- Do not put bottom breadcrumbs in main, ensuring they stay just above the footer even when main content is short. -->
  <LayoutBreadcrumbs v-if="!isHome && showBottomBreadcrumbs" />
</template>

<script setup lang="ts">

const { isFluid } = defineProps<{ isFluid?: boolean }>()

const { portalConfig } = usePortalStore()
const { isIframe, showTopBreadcrumbs, showBottomBreadcrumbs } = useNavigationStore()
const route = useRoute()
const isHome = computed(() => route.path === '/')

// prevent a weird bug with the css var --v-layout-top that changes when we scroll while it shouldn't
const headerPadding = computed(() => {
  if (isIframe.value) return 0
  const showHeader = (isHome.value && portalConfig.value.headerHomeActive) ? portalConfig.value.headerHome?.show : portalConfig.value.header.show
  return 64 + (showHeader ? 128 : 0)
})
</script>
