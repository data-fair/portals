<template>
  <v-menu>
    <template #activator="{props}">
      <v-btn
        v-bind="props"
        title="Menu de navigation"
        variant="text"
        tile
        :icon="mdiMenu"
        :height="64"
        :width="64"
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
