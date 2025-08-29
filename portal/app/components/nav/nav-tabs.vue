<template>
  <v-tabs
    v-model="activeTab"
    align-tabs="center"
  >

    <v-tab value="datasets">Jeux de données</v-tab>

    <v-menu open-on-hover>
      <template #activator="{ props }">
        <v-tab v-bind="props" value="visualizations">Visualisations</v-tab>
      </template>
      <v-list>
        <v-list-item value="catalogue">
          <v-list-item-title>Catalogue</v-list-item-title>
        </v-list-item>
        <v-list-item value="example">
          <v-list-item-title>Example</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-tab value="contact">Contact</v-tab>
  </v-tabs>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal'

defineProps<{
  menu: PortalConfig['menu']
}>()

const activeTab = ref('datasets')
</script>
