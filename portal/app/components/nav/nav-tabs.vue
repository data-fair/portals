<template>
  <v-spacer />
  <v-tabs
    v-model="computedActiveTab"
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
            :text="link.title"
            :append-icon="mdiChevronDown"
            :prepend-icon="link.icon?.svgPath"
            :value="i"
          />
        </template>
        <nav-tabs-menu-item :children="link.children" />
      </v-menu>
      <v-tab
        v-else-if="link?.type === 'external'"
        :text="link.title"
        :prepend-icon="link.icon?.svgPath"
        :href="link.href"
        target="_blank"
        rel="noopener"
        :value="i"
      />
      <v-tab
        v-else
        :text="resolveLinkTitle(link, locale)"
        :prepend-icon="link.icon?.svgPath"
        :to="resolveLink(link)"
        :value="i"
      />
    </template>
  </v-tabs>
</template>

<script setup lang="ts">
import type { MenuItem } from '#api/types/portal'
import { mdiChevronDown } from '@mdi/js'

const props = defineProps<{ navigation: MenuItem[] }>()

const route = useRoute()
const { locale } = useI18n()
const { isMenuItemActive, resolveLink, resolveLinkTitle } = useNavigationStore()

/** Get the active tab index based on the current route */
const computedActiveTab = computed(() => {
  for (const [i, item] of props.navigation.entries()) {
    if (isMenuItemActive(item, route.path)) return i
  }
  return undefined // No match found, no active tab and slider
})

</script>

<style scoped lang="css">
/* Increase the height of the tab slider */
:deep(.v-tab__slider) {
  height: 4px !important;
}
</style>
