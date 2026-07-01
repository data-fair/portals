<template>
  <component
    :is="preview ? VToolbar : VAppBar"
    v-model="appBarActive"
    :color="headerConfig.show && headerConfig.color ? headerConfig.color : navBarConfig.color"
    :class="[
      (navBarConfig.transparent && scrolled) ? 'opacity-90' : undefined,
      navBarConfig.color === 'background' ? 'header-border-inner' : undefined
    ]"
    :extension-height="64"
    :height="headerConfig.show ? 128 : 0"
    :scroll-behavior="scrollBehavior + ' elevate'"
    scroll-threshold="150"
    tag="header"
  >
    <!-- Header (128px) -->
    <layout-header
      v-if="headerConfig.show"
      :header-config="headerConfig"
    />

    <!-- Navigation Bar (64px) -->
    <template #extension>
      <layout-nav-bar :nav-bar-config="navBarConfig" />
    </template>
  </component>

  <nav-drawer :navigation="portalConfig.menu.children" />
</template>

<script setup lang="ts">
import { VToolbar, VAppBar } from 'vuetify/components'

const { home } = defineProps<{ home?: boolean }>()
const { portalConfig, preview } = usePortalStore()
const { scrolled, appBarActive } = useNavigationStore()

const headerConfig = computed(() => {
  if (!home || !portalConfig.value.headerHomeActive) return portalConfig.value.header
  return { ...portalConfig.value.header, ...portalConfig.value.headerHome }
})

const navBarConfig = computed(() => {
  if (!home || !portalConfig.value.navBarHomeActive) return portalConfig.value.navBar
  return { ...portalConfig.value.navBar, ...portalConfig.value.navBarHome }
})

// `hide` slides the header out while keeping the extension (nav bar) pinned,
// `fully-hide` slides both away, `default` keeps everything. The header hides
// unless kept; the nav bar only hides when shown and neither bar is kept.
const scrollBehavior = computed(() => {
  if (!headerConfig.value.show || headerConfig.value.keepOnScroll) return 'default'
  return navBarConfig.value.keepOnScroll ? 'hide' : 'fully-hide'
})

</script>

<style>
.v-app-bar {
  transition-property: all !important;
}

/* Show a inner border when the color background is "background" */
.header-border-inner.v-toolbar--flat::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(var(--v-border-color), var(--v-border-opacity));
  transition: opacity 0.3s ease;
}

/* Hide the border when scrolled */
.header-border-inner.v-toolbar:not(.v-toolbar--flat)::after {
  opacity: 0;
}
</style>
