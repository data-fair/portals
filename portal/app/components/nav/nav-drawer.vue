<template>
  <v-navigation-drawer
    id="nav-drawer"
    v-model="drawer"
    :aria-label="t('mobileNavigation')"
    :style="{ top: `${appBarBottom}px` }"
    temporary
  >
    <!-- VList makes the list itself the only tab stop and gives items tabindex="-2",
         reserving arrow keys for the menu pattern. A drawer is a navigation, not a
         menu: the links carry the tab order (tabindex="0" in nav-drawer-item.vue)
         and the wrapper is skipped. -->
    <v-list
      :role="undefined"
      tag="ul"
      tabindex="-1"
      style="list-style: none"
      color="primary"
      nav
    >
      <nav-drawer-item
        v-for="(item, i) of navigation"
        :key="`item-${i}`"
        :item="item"
        :level="1"
        :show-divider="showDivider(i)"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import type { MenuItem } from '#api/types/portal'

const { navigation } = defineProps<{ navigation: MenuItem[] }>()

const { t } = useI18n()
const { drawer, appBarBottom } = useNavigationStore()

// One divider at each group boundary (never doubled): before an item only when it,
// or the item before it, is a group.
const isGroup = (item?: MenuItem) => item?.type === 'submenu' && !!item.children?.length
const showDivider = (i: number) => i > 0 && (isGroup(navigation[i]) || isGroup(navigation[i - 1]))

// When the drawer opens, move focus into the drawer so users don't have to tab out
// of the header first. v-navigation-drawer traps focus but does not auto-focus content.
watch(drawer, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  // Wait one extra frame for the drawer transition to complete rendering
  requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>(
      '#nav-drawer a[href], #nav-drawer button:not([disabled])'
    )
    target?.focus()
  })
})

</script>

<i18n lang="yaml">
  en:
    mobileNavigation: 'Navigation menu'
  fr:
    mobileNavigation: 'Menu de navigation'
</i18n>
