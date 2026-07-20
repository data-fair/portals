<template>
  <v-navigation-drawer
    id="nav-drawer"
    v-model="drawer"
    :aria-label="t('mobileNavigation')"
    :style="{ top: `${appBarBottom}px` }"
    temporary
  >
    <v-list
      role="presentation"
      color="primary"
      nav
    >
      <nav-drawer-item
        v-for="(item, i) of navigation"
        :key="`item-${i}`"
        :item="item"
        :level="1"
        :is-first="i === 0"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import type { MenuItem } from '#api/types/portal'

defineProps<{ navigation: MenuItem[] }>()

const { t } = useI18n()
const { drawer, appBarBottom } = useNavigationStore()

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
