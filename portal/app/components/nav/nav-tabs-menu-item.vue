<template>
  <v-list>
    <v-list-item
      v-for="(link, j) of children"
      :key="j"
      :title="link.title"
      :append-icon="link.type === 'submenu' && link.children.length ? mdiChevronRight : undefined"
      :active="isItemActive(link)"
      :density="density"
      :to="link.type !== 'external' && link.type !== 'submenu' ? resolveLink(link) : undefined"
      :href="link.type === 'external' ? link.href : undefined"
      :target="link.type === 'external' ? '_blank' : undefined"
      :rel="link.type === 'external' ? 'noopener' : undefined"
      color="primary"
    >
      <v-menu
        v-if="link.type === 'submenu' && link.children?.length"
        :open-on-focus="false"
        activator="parent"
        open-on-hover
        submenu
      >
        <nav-tabs-menu-item
          :children="link.children"
          :density="density"
        />
      </v-menu>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { PortalConfig, MenuItem } from '#api/types/portal'
import { mdiChevronRight } from '@mdi/js'

defineProps<{
  children: MenuItem[]
  density: PortalConfig['header']['density']
}>()

const route = useRoute()
const { isMenuItemActive, resolveLink } = useNavigationStore()

/** Check if the given item is active based on the current route */
function isItemActive (item: MenuItem): boolean {
  return isMenuItemActive(item, route.path)
}

</script>
