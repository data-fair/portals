<template>
  <v-navigation-drawer
    v-model="drawer"
    temporary
  >
    <v-list
      color="primary"
      nav
    >
      <nav-drawer-item
        v-for="(item, i) of navigation"
        :key="`item-${i}`"
        :item="item"
        :level="1"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import type { MenuItem } from '#api/types/portal'

defineProps<{ navigation: MenuItem[] }>()

const { drawer } = useNavigationStore()

</script>
