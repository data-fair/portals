<template>
  <v-spacer />
  <v-tabs
    v-model="activeTab"
    :density="density"
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
  density: PortalConfig['header']['density']
}>()

const activeTab = ref('datasets')
</script>

<style scoped lang="css">
:deep(.v-tab__slider) {
  height: 4px !important;
}
</style>
