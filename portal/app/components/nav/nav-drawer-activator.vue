<template>
  <v-toolbar-items>
    <v-btn
      variant="text"
      :title="t('openNavigationMenu')"
      :icon="mdiMenu"
      stacked
      @click="drawer = true"
    />
  </v-toolbar-items>
</template>

<script setup lang="ts">
import { mdiMenu } from '@mdi/js'

const { t } = useI18n()
const { drawer } = useNavigationStore()

</script>

<i18n lang="yaml">
  en:
    openNavigationMenu: "Open navigation menu"
  fr:
    openNavigationMenu: "Ouvrir le menu de navigation"
</i18n>
