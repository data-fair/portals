<template>
  <component
    :is="detached ? VToolbar : VAppBar"
    density="comfortable"
    flat
  >
    <!-- If mobile, show menu to open navigation drawer -->
    <v-breadcrumbs
      v-if="showBreadcrumbs"
      :items="breadcrumbs"
    />

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

const { breadcrumbs, showBreadcrumbs } = useNavigationStore()

</script>
