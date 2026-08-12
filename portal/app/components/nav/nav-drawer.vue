<template>
  <v-navigation-drawer
    id="nav-drawer"
    v-model="drawer"
    :aria-label="t('mobileNavigation')"
    :style="{ top: `${appBarBottom}px` }"
    temporary
    @keydown.esc="close"
    @focusout="closeOnFocusOut"
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
// of the header first. v-navigation-drawer neither traps focus nor auto-focuses content.
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

const activator = () => document.querySelector<HTMLElement>('[aria-controls="nav-drawer"]')
function close () {
  drawer.value = false
  activator()?.focus()
}

// Focus is moved into the drawer on open but nothing holds it there: tabbing past
// the last link would leave it on the page behind the drawer and its scrim, out of
// sight (RGAA 10.7). Close on the way out, like the header submenus do.
function closeOnFocusOut (e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (next && !(e.currentTarget as HTMLElement).contains(next)) drawer.value = false
}

</script>

<style scoped>
/* VList spaces nav items with `.v-list-item:not(:first-child)`. Each item is now the
   only child of its <li>, so they all became first children and lost the 4px gap:
   carry it on the <li> instead. */
:deep(li:not(:first-child) > .v-list-item),
:deep(li:not(:first-child) > .v-list-group > .v-list-item),
:deep(.v-list-group__items li > .v-list-item) {
  margin-top: 4px;
}
</style>

<i18n lang="yaml">
  en:
    mobileNavigation: 'Navigation menu'
  fr:
    mobileNavigation: 'Menu de navigation'
</i18n>
