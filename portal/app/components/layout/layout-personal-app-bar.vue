<template>
  <component
    :is="preview ? VToolbar : VAppBar"
    density="comfortable"
    flat
  >
    <!-- If mobile, show menu to open navigation drawer -->
    <v-btn
      v-if="$vuetify.display.smAndDown"
      variant="text"
      :icon="drawer ? mdiMenuOpen : mdiMenu"
      :title="t('openNavigationMenu')"
      @click="drawer = !drawer"
    />
    <v-breadcrumbs :items="breadcrumbs" />

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
import { mdiMenu, mdiMenuOpen } from '@mdi/js'

const { preview } = usePortalStore()
const { drawer, breadcrumbs } = useNavigationStore()
const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    openNavigationMenu: "Open navigation menu"
  fr:
    openNavigationMenu: "Ouvrir le menu de navigation"
</i18n>
