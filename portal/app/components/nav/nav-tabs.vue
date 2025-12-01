<template>
  <v-spacer v-if="!navBarConfig.align || navBarConfig.align === 'center'" />
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
      >
        <template #activator="{ props: menuProps }">
          <v-tab
            v-bind="menuProps"
            :class="!navBarConfig.tabsStyle?.includes('uppercaseTitle') ? 'text-none' : undefined"
            :style="navBarConfig.tabsStyle?.includes('largerFont') ? 'font-size: 1rem' : undefined"
            :text="link.title"
            :append-icon="mdiChevronDown"
            :value="i"
          >
            <template #prepend>
              <v-icon
                v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
                :icon="link.icon.mdi?.svgPath || link.icon.custom"
                :color="link.icon.color"
              />
            </template>
          </v-tab>
        </template>
        <nav-tabs-menu-item :children="link.children" />
      </v-menu>
      <v-tab
        v-else-if="link?.type === 'external'"
        :class="!navBarConfig.tabsStyle?.includes('uppercaseTitle') ? 'text-none' : undefined"
        :style="navBarConfig.tabsStyle?.includes('largerFont') ? 'font-size: 1rem' : undefined"
        :text="link.title"
        :href="link.href"
        target="_blank"
        rel="noopener"
        :value="i"
      >
        <template #prepend>
          <v-icon
            v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
            :icon="link.icon.mdi?.svgPath || link.icon.custom"
            :color="link.icon.color"
          />
        </template>
      </v-tab>
      <v-tab
        v-else
        :class="!navBarConfig.tabsStyle?.includes('uppercaseTitle') ? 'text-none' : undefined"
        :style="navBarConfig.tabsStyle?.includes('largerFont') ? 'font-size: 1rem' : undefined"
        :text="resolveLinkTitle(link, locale)"
        :to="resolveLink(link)"
        :value="i"
      >
        <template #prepend>
          <v-icon
            v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
            :icon="link.icon.mdi?.svgPath || link.icon.custom"
            :color="link.icon.color"
          />
        </template>
      </v-tab>
    </template>
  </v-tabs>
</template>

<script setup lang="ts">
import type { MenuItem, NavBar } from '#api/types/portal'
import { mdiChevronDown } from '@mdi/js'

const { navigation } = defineProps<{
  navigation: MenuItem[]
  navBarConfig: NavBar
}>()

const route = useRoute()
const { locale } = useI18n()
const { isMenuItemActive, resolveLink, resolveLinkTitle } = useNavigationStore()
const { preview } = usePortalStore()

// we use MutationObserver to watch for change of class .v-slide-group--is-overflowing by vuetify
// https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/components/VSlideGroup/VSlideGroup.tsx#L153
const overflowing = defineModel('overflowing', { type: Boolean })
let observer: MutationObserver
onMounted(() => {
  observer = new MutationObserver(() => {
    overflowing.value = !!document.querySelector('.nav-tabs.v-slide-group--is-overflowing')
  })
  observer.observe(document.querySelector('.nav-tabs')!, { attributes: true, attributeFilter: ['class'] })
})
onUnmounted(() => observer.disconnect())

/** Get the active tab index based on the current route */
const computedActiveTab = computed(() => {
  for (const [i, item] of navigation.entries()) {
    if (isMenuItemActive(item, route.path)) return i
  }
  return undefined // No match found, no active tab and slider
})

/** For preview mode */
const activeTab = ref<number | undefined>()

/** Writable model for v-model: uses activeTab when previewing, otherwise reads computedActiveTab */
const modelTab = preview ? activeTab : computedActiveTab

</script>

<style scoped lang="css">
/* Increase the height of the tab slider */
:deep(.v-tab__slider) {
  height: 4px !important;
}
</style>
