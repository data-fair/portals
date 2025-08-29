<template>
  <component
    :is="detached ? VToolbar : VAppBar"
    :color="mergedOptions.color"
    :density="mergedOptions.density"
    :extension-height="64"
    :height="portalConfig.header.hidden ? 0 : 128"
    :scroll-behavior="mergedOptions.scrollBehavior"
  >
    <!-- Header (128px)-->
    <layout-header v-if="!portalConfig.header.hidden" />

    <!-- Navigation Bar (64px) -->
    <template #extension>
      <layout-header-logo v-if="portalConfig.header.hidden"/>

      <nav-tabs-or-menu :menu="portalConfig.menu" />

      <div>Compte</div>
    </template>
  </component>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal'
import { VToolbar, VAppBar } from 'vuetify/components'

const { portalConfig, home } = defineProps({
  portalConfig: { type: Object as () => PortalConfig, required: true },
  home: { type: Boolean, default: false },
  detached: { type: Boolean, default: false }
})

const mergedOptions = computed(() => {
  if (!home) return portalConfig.appBar
  return { ...portalConfig.appBar, ...portalConfig.appBarHome }
})

</script>
