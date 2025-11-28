<template>
  <!-- Smaller screens: navigation in drawer -->
  <nav-drawer-activator v-if="$vuetify.display.smAndDown || tabsOverflowing" />

  <!-- Larger screens: navigation in tabs -->
  <nav-tabs
    v-else
    v-model:overflowing="tabsOverflowing"
    :navigation="navigation"
    :nav-bar-config="navBarConfig"
  />
</template>

<script setup lang="ts">
import type { MenuItem, NavBar } from '#api/types/portal-config'

defineProps<{
  navigation: MenuItem[]
  navBarConfig: NavBar
}>()

const tabsOverflowing = ref(false)
</script>
