<template>
  <v-container
    :class="`bg-${navBarConfig.color}`"
    class="pa-0 h-100"
    fluid
  >
    <v-row
      align="center"
      no-gutters
      class="h-100 flex-nowrap"
    >
      <layout-header-logo
        v-if="logo"
        :height="(appBarHeight || 64) - 10"
        :link="navBarConfig.logoLink"
        :logo="logo"
        class="pl-4"
      />

      <nav-tabs-or-drawer
        :navigation="portalConfig.menu.children"
        :nav-bar-config="navBarConfig"
      />

      <v-spacer />

      <v-toolbar-items v-if="portalConfig.authentication !== 'none'">
        <notification-queue />
        <layout-personal-menu
          :login-color="navBarConfig.loginColor"
          :nav-bar-color="navBarConfig.color"
        />
      </v-toolbar-items>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { NavBar } from '#api/types/portal-config'
import { useDisplay } from 'vuetify'
import { useElementSize } from '@vueuse/core'

const { navBarConfig } = defineProps<{
  navBarConfig: NavBar
}>()

const { portalConfig } = usePortalStore()
const display = useDisplay()

const appBarRef = ref()
const { height: appBarHeight } = useElementSize(appBarRef)

const logo = computed(() => {
  if (navBarConfig.logoType !== 'hidden' && display.xs.value) {
    if (navBarConfig.logoMobile) return navBarConfig.logoMobile
    else return null
  } else if (navBarConfig.logoType === 'local' && navBarConfig.logo) {
    return navBarConfig.logo
  } else if (navBarConfig.logoType === 'default' && portalConfig.value.logo) {
    return portalConfig.value.logo
  }
  return null
})

</script>
