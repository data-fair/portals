<template>
  <v-menu>
    <template #activator="{props}">
      <v-btn
        v-bind="props"
        title="Ouvrir le menu de navigation"
        variant="text"
        :icon="mdiMenu"
        tile
      />
    </template>
    <v-list>
        <v-list-item
          v-for="(item, i) of menu.children"
          :key="`item-${i}`"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal'
import { mdiMenu } from '@mdi/js'

defineProps<{
  menu: PortalConfig['menu']
}>()

</script>
