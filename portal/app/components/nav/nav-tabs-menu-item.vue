<template>
  <!-- VList makes the list itself the only tab stop and gives items tabindex="-2",
       reserving arrow keys for the menu pattern. This popup is a disclosure over a
       list of links: the links carry the tab order and the wrapper is skipped. -->
  <v-list
    :id="listId"
    :aria-label="listLabel"
    tag="ul"
    tabindex="-1"
    style="list-style: none"
  >
    <li
      v-for="(link, j) of children"
      :key="j"
    >
      <v-list-item
        :title="resolveLinkTitle(link, locale)"
        :append-icon="link.type === 'submenu' && link.children.length ? mdiChevronRight : undefined"
        :active="isItemActive(link)"
        :to="link.type !== 'submenu' && !isExternalLink(link) ? resolveLink(link) : undefined"
        :href="link.type !== 'submenu' && isExternalLink(link) ? resolveLink(link) : undefined"
        :target="link.type === 'external' && link.target ? '_blank' : undefined"
        :rel="link.type === 'external' && link.target ? 'noopener' : undefined"
        :role="undefined"
        color="primary"
        tabindex="0"
        link
      >
        <template #prepend>
          <v-icon
            v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
            :icon="link.icon.mdi?.svgPath || link.icon.custom"
            :color="link.icon.color"
          />
        </template>
        <!-- no aria-haspopup: same rationale as the top level in nav-tabs.vue -->
        <v-menu
          v-if="link.type === 'submenu' && link.children?.length"
          :open-on-focus="false"
          :activator-props="{ 'aria-haspopup': undefined, 'aria-owns': undefined }"
          activator="parent"
          open-on-hover
          submenu
        >
          <nav-tabs-menu-item
            :children="link.children"
            :list-label="link.title"
          />
        </v-menu>
      </v-list-item>
    </li>
  </v-list>
</template>

<script setup lang="ts">
import type { MenuItem } from '#api/types/portal'
import { mdiChevronRight } from '@mdi/js'

defineProps<{
  children: MenuItem[]
  listId?: string
  listLabel?: string
}>()

const route = useRoute()
const { locale } = useI18n()
const { isMenuItemActive, isExternalLink, resolveLink, resolveLinkTitle } = useNavigationStore()

/** Check if the given item is active based on the current route */
function isItemActive (item: MenuItem): boolean {
  return isMenuItemActive(item, route.path)
}

</script>

<style scoped>
/* Vuetify keys the "menu open" tint on [aria-haspopup=menu][aria-expanded=true].
   The submenu triggers drop aria-haspopup (their popup is a list of links, not a
   menu), so re-apply the same overlay opacities on aria-expanded alone. */
:deep(.v-list-item[aria-expanded='true'] > .v-list-item__overlay) {
  opacity: calc(var(--v-activated-opacity) * var(--v-theme-overlay-multiplier));
}
:deep(.v-list-item[aria-expanded='true']:hover > .v-list-item__overlay) {
  opacity: calc((var(--v-activated-opacity) + var(--v-hover-opacity)) * var(--v-theme-overlay-multiplier));
}
:deep(.v-list-item[aria-expanded='true']:focus-visible > .v-list-item__overlay) {
  opacity: calc((var(--v-activated-opacity) + var(--v-focus-opacity)) * var(--v-theme-overlay-multiplier));
}
</style>
