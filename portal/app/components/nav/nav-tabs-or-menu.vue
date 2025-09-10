<template>
  <!-- Smaller screens: navigation in menu -->
  <nav-menu
    v-if="$vuetify.display.smAndDown"
    :navigation="navigation"
  />

  <!-- Larger screens: navigation in tabs -->
  <nav-tabs
    v-else
    :navigation="navigation"
    :density="density"
  />
</template>

<script setup lang="ts">
import type { PortalConfig, MenuItem } from '#api/types/portal'
defineProps<{
  navigation: MenuItem[]
  density: PortalConfig['header']['density']
}>()
</script>
