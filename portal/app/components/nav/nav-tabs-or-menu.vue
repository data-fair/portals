<template>
  <!-- Smaller screens: navigation in menu -->
  <nav-menu
    v-if="$vuetify.display.smAndDown"
    :menu="menu"
  />

  <!-- Larger screens: navigation in tabs -->
  <nav-tabs
    v-else
    :menu="menu"
  />
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal'
defineProps<{
  menu: PortalConfig['menu']
}>()
</script>
