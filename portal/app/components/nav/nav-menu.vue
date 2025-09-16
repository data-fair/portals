<template>
  <v-menu>
    <template #activator="{props}">
      <v-btn
        v-bind="props"
        variant="text"
        :title="t('openNavigationMenu')"
        :icon="mdiMenu"
        tile
      />
    </template>
    <v-list>
      <v-list-item
        v-for="(item, i) of navigation"
        :key="`item-${i}`"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import type { MenuItem } from '#api/types/portal'
import { mdiMenu } from '@mdi/js'

defineProps<{
  navigation: MenuItem[]
}>()

const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    openNavigationMenu: "Open navigation menu"
  fr:
    openNavigationMenu: "Ouvrir le menu de navigation"
</i18n>
