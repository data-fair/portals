<template>
  <v-spacer />
  <v-tabs
    v-model="activeTab"
    :density="density"
  >
    <template
      v-for="(link, i) of navigation"
      :key="i"
    >
      <v-menu
        v-if="link?.type === 'submenu' && link.children.length"
      >
        <template #activator="{ props }">
          <v-tab
            v-bind="props"
            :text="link.title"
            :append-icon="mdiChevronDown"
          />
        </template>
        <nav-tabs-menu-item :children="link.children"/>
      </v-menu>
      <v-tab
        v-else-if="link?.type === 'external'"
        :text="link.title"
        :href="link.href"
        target="_blank"
        rel="noopener"
      />
      <v-tab
        v-else
        :text="link?.title"
        :to="useResolveLink(link)"
      />
    </template>
  </v-tabs>
</template>

<script setup lang="ts">
import type { PortalConfig, MenuItem } from '#api/types/portal'
import { mdiChevronDown } from '@mdi/js'

defineProps<{
  navigation: MenuItem[]
  density: PortalConfig['header']['density']
}>()

const activeTab = ref('datasets')

</script>

<style scoped lang="css">
/* Increase the height of the tab slider */
:deep(.v-tab__slider) {
  height: 4px !important;
}
</style>
