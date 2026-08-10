<template>
  <v-app-bar
    ref="appBarRef"
    :color="portalConfig.navBar.color"
    flat
  >
    <!-- Logo -->
    <layout-header-logo
      v-if="logo"
      :height="(appBarHeight || 64) - 10"
      :logo="logo"
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
