<template>
  <component
    :is="preview ? VToolbar : VAppBar"
    ref="appBarRef"
    :color="navBarConfig.color"
    :class="navBarConfig.transparent ? 'opacity-90' : undefined"
    :extension-height="64"
    :height="headerConfig.show ? 128 : 0"
    :scroll-behavior="scrollBehavior + ' elevate'"
    scroll-threshold="10"
  >
    <!-- Header (128px)-->
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

const appBarRef = ref()

const headerConfig = computed(() => {
  if (!home || !portalConfig.value.headerHomeActive) return portalConfig.value.header
  return { ...portalConfig.value.header, ...portalConfig.value.headerHome }
})

const navBarConfig = computed(() => {
  if (!home || !portalConfig.value.navBarHomeActive) return portalConfig.value.navBar
  return { ...portalConfig.value.navBar, ...portalConfig.value.navBarHome }
})

const scrollBehavior = computed(() => {
  if (headerConfig.value.show && !headerConfig.value.keepOnScroll && !navBarConfig.value.keepOnScroll) {
    return 'fully-hide'
  }
  if (navBarConfig.value.keepOnScroll && headerConfig.value.show) {
    return 'hide'
  }
  return 'default'
})

</script>
