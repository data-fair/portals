<template>
  <v-app-bar
    ref="appBarRef"
    :color="portalConfig.navBar.color"
    flat
  >
    <!--
      Logo: hidden between the sm and md breakpoints, where it shares this fixed-height bar
      with the breadcrumbs. A wide logo leaves too little room there and pushes the end of the
      trail out of the window, with no way to scroll to it (RGAA 10.11 and 10.12). Below sm the
      breadcrumbs are hidden, so the logo gets the bar back.
    -->
    <layout-header-logo
      v-if="logo"
      :height="(appBarHeight || 64) - 10"
      :logo="logo"
      class="d-sm-none d-md-flex"
    />

    <!-- Breadcrumbs -->
    <v-spacer />
    <LayoutBreadcrumbs is-layout-full />
    <v-spacer />

    <!-- Agent Chat -->
    <div
      id="agent-chat-appbar"
      class="d-flex align-center"
    />
  </v-app-bar>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'

const { portalConfig } = usePortalStore()
const themedLogo = useThemedLogo()

const appBarRef = ref()
const { height: appBarHeight } = useElementSize(appBarRef)

const logo = computed(() => themedLogo(portalConfig.value.logo, portalConfig.value.logoDark))

</script>
