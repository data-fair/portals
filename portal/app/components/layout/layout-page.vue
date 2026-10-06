<template>
  <v-main :style="`position: relative; padding-top: ${headerPadding}px;`">
    <div
      id="contenu"
      tabindex="-1"
    >
      <LayoutBreadcrumbs v-if="!isHome && showTopBreadcrumbs" />
      <v-container
        :class="{ 'pt-0': showTopBreadcrumbs, 'px-lg-16': tocGutter }"
        :fluid="isFluid"
      >
        <slot />
      </v-container>
    </div>
  </v-main>

  <!-- The table of contents only earns its place once hydrated, so it never renders during SSR. -->
  <client-only>
    <page-toc :is-fluid="isFluid" />
  </client-only>

  <!-- Do not put bottom breadcrumbs in main, ensuring they stay just above the footer even when main content is short. -->
  <LayoutBreadcrumbs v-if="!isHome && showBottomBreadcrumbs" />
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page'

const { isFluid } = defineProps<{ isFluid?: boolean }>()

// On full-width pages the table of contents is a floating button: on large screens keep a gutter on both sides
// (symmetric so root banners stay centered) so it never covers the content.
const pageConfig = inject<Ref<PageConfig | null> | undefined>('page-config', undefined)
const tocGutter = computed(() => isFluid && !!pageConfig?.value?._toc?.length)

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
