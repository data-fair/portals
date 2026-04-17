<template>
  <div
    id="header-navigation"
    tabindex="-1"
    class="d-flex flex-grow-1 h-100"
  >
    <!-- Smaller screens: navigation in drawer -->
    <nav-drawer-activator v-if="$vuetify.display.smAndDown || tabsOverflowing" />

    <!-- Larger screens: navigation in tabs -->
    <template v-else>
      <v-spacer v-if="!navBarConfig.align || navBarConfig.align === 'center'" />
      <nav-tabs
        v-model:overflowing="tabsOverflowing"
        :navigation="navigation"
        :nav-bar-config="navBarConfig"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem, NavBar } from '#api/types/portal-config'

defineProps<{
  navigation: MenuItem[]
  navBarConfig: NavBar
}>()

const tabsOverflowing = ref(false)
</script>
