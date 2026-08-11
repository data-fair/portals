<template>
  <!--
    role="presentation": Vuetify hardcodes role="list" on v-list while VListItem
    exposes its links as role="link", so screen readers get a list whose children
    are not listitems. Same fix as the mobile drawer. The list also carries a
    tabindex, so the conflict resolution rules drop the presentation role and the
    element falls back to the div's implicit generic role — which is what we want.
  -->
  <v-list
    :id="listId"
    ref="listRef"
    :aria-label="listLabel"
    role="presentation"
  >
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
      <!-- eager + no aria-haspopup: same rationale as the top level in nav-tabs.vue -->
      <v-menu
        v-if="link.type === 'submenu' && link.children?.length"
        :open-on-focus="false"
        :activator-props="{ 'aria-haspopup': undefined }"
        activator="parent"
        eager
        open-on-hover
        submenu
      >
        <nav-tabs-menu-item
          :children="link.children"
          :list-label="link.title"
        />
      </v-menu>
    </v-list-item>
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

const listRef = ref()

/**
 * Force items to be in the natural tab order. Vuetify's VList applies
 * tabindex="-2" to items (and tabindex="0" on the list itself) when rendered
 * inside a VMenu, reserving arrow-key roving focus for the menu pattern.
 * The header nav uses the disclosure pattern instead, so we want Tab to flow
 * through items and skip the list wrapper.
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

/** Check if the given item is active based on the current route */
function isItemActive (item: MenuItem): boolean {
  return isMenuItemActive(item, route.path)
}

</script>
