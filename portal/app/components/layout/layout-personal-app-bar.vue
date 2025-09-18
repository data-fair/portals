<template>
  <component
    :is="preview ? VToolbar : VAppBar"
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
import { VToolbar, VAppBar } from 'vuetify/components'

const { preview } = usePortalStore()
const { breadcrumbs, showBreadcrumbs } = useNavigationStore()

</script>
