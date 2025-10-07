<template>
  <v-navigation-drawer
    v-model="drawer"
    temporary
  >
    <v-list
      :density="density"
      color="primary"
      nav
    >
      <nav-drawer-item
        v-for="(item, i) of navigation"
        :key="`item-${i}`"
        :density="density"
        :item="item"
        :level="1"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import type { PortalConfig, MenuItem } from '#api/types/portal'

defineProps<{
  navigation: MenuItem[]
  density: PortalConfig['header']['density']
}>()

const { drawer } = useNavigationStore()

</script>
