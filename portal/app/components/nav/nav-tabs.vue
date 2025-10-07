<template>
  <v-spacer />
  <v-tabs
    :model-value="computedActiveTab"
    :density="density"
  >
    <template
      v-for="(link, i) of navigation"
      :key="i"
    >
      <v-menu
        v-if="link?.type === 'submenu' && link.children.length"
      >
        <template #activator="{ props: menuProps }">
          <v-tab
            v-bind="menuProps"
            :text="link.title"
            :append-icon="mdiChevronDown"
            :value="i"
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
        :value="i"
      />
      <v-tab
        v-else
        :text="link?.title"
        :to="useResolveLink(link)"
        :value="i"
      />
    </template>
  </v-tabs>
</template>

<script setup lang="ts">
import type { PortalConfig, MenuItem } from '#api/types/portal'
import { mdiChevronDown } from '@mdi/js'

const props = defineProps<{
  navigation: MenuItem[]
  density: PortalConfig['header']['density']
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

/** Get the active tab index based on the current route */
const computedActiveTab = computed(() => {
  for (const [i, item] of props.navigation.entries()) {
    if (isMenuItemActive(item, route.path)) return i
  }
  return undefined // No match found, no active tab and slider
})

</script>

<style scoped lang="css">
/* Increase the height of the tab slider */
:deep(.v-tab__slider) {
  height: 4px !important;
}
</style>
