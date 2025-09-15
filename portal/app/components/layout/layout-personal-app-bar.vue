<template>
  <component
    :is="detached ? VToolbar : VAppBar"
    density="comfortable"
    flat
  >
    <!-- If drawer, show menu to open navigation drawer -->
    <!-- TODO: Show breadcrumbs -->

    <v-spacer />
    <v-toolbar-items>
      <notification-queue />

      <!-- Personal Menu -->
      <layout-personal-menu personal />
    </v-toolbar-items>
  </component>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal'
import { VToolbar, VAppBar } from 'vuetify/components'

defineProps({
  portalConfig: { type: Object as () => PortalConfig, required: true },
  home: { type: Boolean, default: false },
  detached: { type: Boolean, default: false }
})

</script>
