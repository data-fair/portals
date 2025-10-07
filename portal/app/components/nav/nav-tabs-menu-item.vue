<template>
  <v-list>
    <v-list-item
      v-for="(link, j) of children"
      :key="j"
      :title="link.title"
      :append-icon="link.type === 'submenu' && link.children.length ? mdiChevronRight : undefined"
      :to="link.type !== 'external' && link.type !== 'submenu' ? useResolveLink(link) : undefined"
      :href="link.type === 'external' ? link.href : undefined"
      :target="link.type === 'external' ? '_blank' : undefined"
      :rel="link.type === 'external' ? 'noopener' : undefined"
      :active="isItemActive(link)"
    >
      <v-menu
        v-if="link.type === 'submenu' && link.children?.length"
        :open-on-focus="false"
        activator="parent"
        open-on-hover
        submenu
      >
        <nav-tabs-menu-item  :children="link.children"/>
      </v-menu>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { MenuItem } from '#api/types/portal'
import { mdiChevronRight } from '@mdi/js'

defineProps<{
  children: MenuItem[]
}>()

const route = useRoute()

/** Check if a menu item (or any of its children) matches the current route */
function isMenuItemActive (item: MenuItem, currentPath: string): boolean {
  if (item.type === 'external') return false

  // Check if any child of the submenu matches the route
  if (item.type === 'submenu' && item.children) {
    return item.children.some(child => isMenuItemActive(child, currentPath))
  }

  // Resolve the link to compare with the current route
  const resolvedLink = useResolveLink(item)
  if (!resolvedLink) return false

  // Exact match for the homepage
  if (resolvedLink === '/' && currentPath === '/') return true
  // Check if the current path starts with the resolved link, but avoid matching '/' with everything
  if (resolvedLink !== '/' && currentPath.startsWith(resolvedLink)) return true

  return false
}

/** Check if the given item is active based on the current route */
function isItemActive (item: MenuItem): boolean {
  return isMenuItemActive(item, route.path)
}

</script>
