<template>
  <v-spacer />
  <v-tabs
    v-model="modelTab"
    :slider-color="navBarConfig.sliderColor"
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
            :class="!navBarConfig.uppercaseTitle ? 'text-none' : undefined"
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
        :class="!navBarConfig.uppercaseTitle ? 'text-none' : undefined"
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
        :class="!navBarConfig.uppercaseTitle ? 'text-none' : undefined"
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
