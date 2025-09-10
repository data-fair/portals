<template>
  <v-spacer />
  <v-tabs
    v-model="activeTab"
    :density="density"
  >
    <template
      v-for="(link, i) of navigation"
      :key="i"
    >
      <v-menu
        v-if="link?.type === 'submenu' && link.children.length"
      >
        <template #activator="{ props }">
          <v-tab
            v-bind="props"
            :text="link.title"
            :append-icon="mdiChevronDown"
          />
        </template>
        <nav-tabs-menu-item :children="link.children"/>
      </v-menu>
      <v-tab
        v-else-if="link?.type === 'external'"
        :text="link.title"
        :href="resolveHref(link)"
        target="_blank"
        rel="noopener noreferrer"
      />
      <v-tab
        v-else
        :text="link?.title"
        :to="resolveHref(link)"
      />
    </template>
  </v-tabs>
</template>

<script setup lang="ts">
import type { PortalConfig, MenuItem } from '#api/types/portal'
import { mdiChevronDown } from '@mdi/js'

defineProps<{
  navigation: MenuItem[]
  density: PortalConfig['header']['density']
}>()

const activeTab = ref('datasets')

const resolveHref = (link: MenuItem) => {
  switch (link.type) {
    case 'external': return link.href
    case 'custom': return link.pageRef ? `/page/${link.pageRef._id}` : undefined
    case 'datasets': return '/datasets'
    case 'applications': return '/applications'
    case 'contact': return '/contact'
    case 'home': return '/'
    default: return undefined
  }
}

</script>

<style scoped lang="css">
:deep(.v-tab__slider) {
  height: 4px !important;
}
</style>
