<template>
  <v-app-bar
    ref="appBarRef"
    flat
  >
    <v-container
      class="mx-2"
      fluid
    >
      <v-row align="center">
        <!-- Logo -->
        <layout-header-logo
          v-if="portalConfig.logo"
          :height="(appBarHeight || 64) - 10"
          :logo="portalConfig.logo"
        />

        <!-- Breadcrumbs -->
        <v-spacer />
        <layout-breadcrumbs />
        <v-spacer />

      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'

const { portalConfig } = usePortalStore()

const appBarRef = ref()
const { height: appBarHeight } = useElementSize(appBarRef)

</script>
