<template>
  <v-navigation-drawer
    id="nav-drawer"
    v-model="drawer"
    :aria-label="t('mobileNavigation')"
    :style="{ top: `${appBarBottom}px` }"
    temporary
  >
    <v-list
      ref="listRef"
      :role="undefined"
      tag="ul"
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
const isGroup = (item: MenuItem) => item.type === 'submenu' && !!item.children?.length
const showDivider = (i: number) => i > 0 && (isGroup(navigation[i]) || isGroup(navigation[i - 1]))

const listRef = ref()

/**
 * Force items to be in the natural tab order. Vuetify's VList applies
 * tabindex="-2" to items (and tabindex="0" on the list itself), reserving
 * arrow-key roving focus for the menu pattern. The drawer is a navigation, not a
 * menu: without this only the first link is reachable and Tab jumps straight out
 * of the drawer to the content behind it. Same treatment as the header submenus
 * in nav-tabs-menu-item.vue.
 */
function sanitizeItemsTabindex () {
  const el = (listRef.value?.$el ?? listRef.value) as HTMLElement | null
  if (!el) return
  if (el.getAttribute('tabindex') !== '-1') el.setAttribute('tabindex', '-1')
  el.querySelectorAll('.v-list-item').forEach((item) => {
    if (item.getAttribute('tabindex') !== '0') item.setAttribute('tabindex', '0')
  })
}

let observer: MutationObserver | null = null
onMounted(() => {
  sanitizeItemsTabindex()
  const el = (listRef.value?.$el ?? listRef.value) as HTMLElement | null
  if (!el) return
  observer = new MutationObserver(() => sanitizeItemsTabindex())
  observer.observe(el, { attributes: true, subtree: true, attributeFilter: ['tabindex'] })
})
onUnmounted(() => observer?.disconnect())

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
