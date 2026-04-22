<template>
  <nav
    ref="navRootRef"
    :aria-label="t('mainNavigation')"
    class="nav-tabs-wrapper"
  >
    <v-tabs
      v-model="modelTab"
      :slider-color="navBarConfig.sliderColor"
      :class="{ 'ml-8': navBarConfig.align === 'left', 'nav-tabs': true }"
      show-arrows
    >
      <template
        v-for="(link, i) of navigation"
        :key="i"
      >
        <v-menu
          v-if="link?.type === 'submenu' && link.children.length"
          content-class="rounded-t-0"
          @update:model-value="(open) => onMenuToggle(i, open)"
        >
          <template #activator="{ props: menuProps }">
            <v-tab
              v-bind="menuProps"
              :class="[
                navBarConfig.tabsStyle?.includes('uppercaseTitle') ? 'text-uppercase' : undefined,
                navBarConfig.tabsStyle?.includes('boldTitle') ? 'font-weight-bold' : undefined
              ]"
              :style="navBarConfig.tabsStyle?.includes('largerFont') ? 'font-size: 1rem' : undefined"
              :text="link.title"
              :append-icon="mdiChevronDown"
              :value="i"
              :aria-controls="`nav-submenu-${i}`"
            >
              <template
                v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
                #prepend
              >
                <v-icon
                  :icon="link.icon.mdi?.svgPath || link.icon.custom"
                  :color="link.icon.color"
                />
              </template>
            </v-tab>
          </template>
          <nav-tabs-menu-item
            :children="link.children"
            :list-id="`nav-submenu-${i}`"
            :list-label="link.title"
          />
        </v-menu>
        <v-tab
          v-else
          :class="[
            navBarConfig.tabsStyle?.includes('uppercaseTitle') ? 'text-uppercase' : undefined,
            navBarConfig.tabsStyle?.includes('boldTitle') ? 'font-weight-bold' : undefined
          ]"
          :style="navBarConfig.tabsStyle?.includes('largerFont') ? 'font-size: 1rem' : undefined"
          :text="resolveLinkTitle(link, locale)"
          :to="!isExternalLink(link) ? resolveLink(link) : undefined"
          :href="isExternalLink(link) ? resolveLink(link) : undefined"
          :target="link.type === 'external' && link.target ? '_blank' : undefined"
          :rel="link.type === 'external' && link.target ? 'noopener' : undefined"
          :value="i"
        >
          <template
            v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
            #prepend
          >
            <v-icon
              :icon="link.icon.mdi?.svgPath || link.icon.custom"
              :color="link.icon.color"
            />
          </template>
        </v-tab>
      </template>
    </v-tabs>
  </nav>
</template>

<script setup lang="ts">
import type { MenuItem, NavBar } from '#api/types/portal'
import { mdiChevronDown } from '@mdi/js'

const { navigation } = defineProps<{
  navigation: MenuItem[]
  navBarConfig: NavBar
}>()

const route = useRoute()
const { locale, t } = useI18n()
const { isMenuItemActive, isExternalLink, resolveLink, resolveLinkTitle } = useNavigationStore()
const { preview } = usePortalStore()

const navRootRef = ref<HTMLElement>()

// we use MutationObserver to watch for change of class .v-slide-group--is-overflowing by vuetify
// https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/components/VSlideGroup/VSlideGroup.tsx#L153
const overflowing = defineModel('overflowing', { type: Boolean })
let overflowObserver: MutationObserver
let ariaObserver: MutationObserver

/**
 * Strip the ARIA tablist pattern that Vuetify applies to <v-tabs>/<v-tab>.
 * The header navigation is a list of page links, not tabs controlling panels:
 * the tablist pattern forces arrow-key roving focus which is confusing here.
 * With these overrides each tab becomes a regular focusable link/button and Tab
 * key moves through them naturally. Scoped to this component only.
 */
function sanitizeTabsAria () {
  const root = navRootRef.value
  if (!root) return
  const tablist = root.querySelector('[role="tablist"]')
  if (tablist) tablist.removeAttribute('role')
  root.querySelectorAll('.v-tab').forEach((tab) => {
    if (tab.getAttribute('role') === 'tab') tab.removeAttribute('role')
    if (tab.hasAttribute('aria-selected')) tab.removeAttribute('aria-selected')
    if (tab.getAttribute('tabindex') !== '0') tab.setAttribute('tabindex', '0')
  })
}

/**
 * On submenu open: focus the first item so Tab can flow through the menu
 * like a disclosure (per user request). On close: restore focus to the
 * activator tab so keyboard users don't lose their place.
 */
function onMenuToggle (tabIndex: number, open: boolean) {
  if (open) {
    // The menu content is teleported and rendered after the transition.
    // Poll briefly for the first item to appear then focus it.
    let attempts = 0
    const tryFocus = () => {
      const first = document.querySelector<HTMLElement>(`#nav-submenu-${tabIndex} .v-list-item`)
      if (first) {
        first.focus()
        return
      }
      if (attempts++ < 10) setTimeout(tryFocus, 20)
    }
    tryFocus()
  } else {
    const activator = navRootRef.value?.querySelector<HTMLElement>(`.v-tab[aria-controls="nav-submenu-${tabIndex}"]`)
    activator?.focus()
  }
}

onMounted(() => {
  const navTabs = document.querySelector('.nav-tabs')!
  overflowObserver = new MutationObserver(() => {
    overflowing.value = !!document.querySelector('.nav-tabs.v-slide-group--is-overflowing')
  })
  overflowObserver.observe(navTabs, { attributes: true, attributeFilter: ['class'] })

  sanitizeTabsAria()
  ariaObserver = new MutationObserver(() => sanitizeTabsAria())
  ariaObserver.observe(navRootRef.value!, {
    attributes: true,
    subtree: true,
    childList: true,
    attributeFilter: ['role', 'tabindex', 'aria-selected']
  })
})
onUnmounted(() => {
  overflowObserver?.disconnect()
  ariaObserver?.disconnect()
})

/** Get the active tab index based on the current route */
const computedActiveTab = computed(() => {
  for (const [i, item] of navigation.entries()) {
    if (isMenuItemActive(item, route.path)) return i
  }
  return undefined // No match found, no active tab and slider
})

/** Writable model for v-model */
const modelTab = ref<number | undefined>(computedActiveTab.value)
watch(computedActiveTab, (val) => { if (!preview) modelTab.value = val })
</script>

<style scoped lang="css">
/* Increase the height of the tab slider */
:deep(.v-tab__slider) {
  height: 4px !important;
}
/* Keep the <nav> semantic wrapper neutral in the layout (no box): only the ARIA role/label is added. */
.nav-tabs-wrapper {
  display: contents;
}
</style>

<i18n lang="yaml">
  en:
    mainNavigation: 'Main navigation'
  fr:
    mainNavigation: 'Navigation principale'
</i18n>
