<template>
  <v-list>
    <v-list-item
      v-for="(link, j) of children"
      :key="j"
      :title="resolveLinkTitle(link, locale)"
      :append-icon="link.type === 'submenu' && link.children.length ? mdiChevronRight : undefined"
      :active="isItemActive(link)"
      :to="link.type !== 'external' && link.type !== 'submenu' ? resolveLink(link) : undefined"
      :href="link.type === 'external' ? link.href : undefined"
      :target="link.type === 'external' ? '_blank' : undefined"
      :rel="link.type === 'external' ? 'noopener' : undefined"
      color="primary"
      link
    >
      <v-menu
        v-if="link.type === 'submenu' && link.children?.length"
        :open-on-focus="false"
        activator="parent"
        open-on-hover
        submenu
      >
        <nav-tabs-menu-item :children="link.children" />
      </v-menu>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { MenuItem } from '#api/types/portal'
import { mdiChevronRight } from '@mdi/js'

defineProps<{ children: MenuItem[] }>()

const route = useRoute()
const { locale } = useI18n()
const { isMenuItemActive, resolveLink, resolveLinkTitle } = useNavigationStore()

/** Check if the given item is active based on the current route */
function isItemActive (item: MenuItem): boolean {
  return isMenuItemActive(item, route.path)
}

</script>
