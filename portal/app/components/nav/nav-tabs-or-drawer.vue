<template>
  <!-- Smaller screens: navigation in drawer -->
  <nav-drawer-activator v-if="$vuetify.display.smAndDown" />

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
