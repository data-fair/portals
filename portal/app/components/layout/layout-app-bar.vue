<template>
  <component
    :is="preview ? VToolbar : VAppBar"
    ref="appBarRef"
    :color="headerConfig.show && headerConfig.color ? headerConfig.color : navBarConfig.color"
    :class="[
      (navBarConfig.transparent && isScrolled) ? 'opacity-90' : undefined,
      navBarConfig.color === 'background' ? 'header-border-inner' : undefined
    ]"
    :extension-height="64"
    :height="headerConfig.show ? 128 : 0"
    :scroll-behavior="scrollBehavior + ' elevate'"
    scroll-threshold="150"
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
const isScrolled = ref(false)

onMounted(() => {
  if (!preview) {
    const updateScrollState = () => {
      isScrolled.value = window.scrollY > 150
    }
    window.addEventListener('scroll', updateScrollState)
    onBeforeUnmount(() => {
      window.removeEventListener('scroll', updateScrollState)
    })
  }
})

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
