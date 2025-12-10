<template>
  <v-list>
    <v-list-item
      v-for="(link, j) of children"
      :key="j"
      :title="resolveLinkTitle(link, locale)"
      :append-icon="link.type === 'submenu' && link.children.length ? mdiChevronRight : undefined"
      :active="isItemActive(link)"
      :to="link.type !== 'submenu' && !isExternalLink(link) ? resolveLink(link) : undefined"
      :href="link.type !== 'submenu' && isExternalLink(link) ? resolveLink(link) : undefined"
      :target="link.type === 'external' && link.target ? '_blank' : undefined"
      :rel="link.type === 'external' && link.target ? 'noopener' : undefined"
      color="primary"
      link
    >
      <template #prepend>
        <v-icon
          v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
          :icon="link.icon.mdi?.svgPath || link.icon.custom"
          :color="link.icon.color"
        />
      </template>
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
const { isMenuItemActive, isExternalLink, resolveLink, resolveLinkTitle } = useNavigationStore()

/** Check if the given item is active based on the current route */
function isItemActive (item: MenuItem): boolean {
  return isMenuItemActive(item, route.path)
}

</script>
