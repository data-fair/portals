<template>
  <!--
    min-width:0 lets this flex item shrink below the tabs' content width.
    Without it v-tabs stretches the navbar (and gets clipped) instead of
    overflowing internally, which is what makes Vuetify flag the slide group as
    overflowing and triggers the swap to the drawer.
  -->
  <div
    id="header-navigation"
    tabindex="-1"
    class="d-flex flex-grow-1 h-100"
    style="min-width: 0"
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
