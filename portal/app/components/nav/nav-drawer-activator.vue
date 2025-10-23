<template>
  <v-toolbar-items>
    <v-btn
      variant="text"
      :title="t('openNavigationMenu')"
      :icon="drawer ? mdiMenuOpen : mdiMenu"
      stacked
      @click="drawer = !drawer"
    />
  </v-toolbar-items>
</template>

<script setup lang="ts">
import { mdiMenu, mdiMenuOpen } from '@mdi/js'

const { t } = useI18n()
const { drawer } = useNavigationStore()

</script>

<i18n lang="yaml">
  en:
    openNavigationMenu: "Open navigation menu"
  fr:
    openNavigationMenu: "Ouvrir le menu de navigation"
</i18n>
