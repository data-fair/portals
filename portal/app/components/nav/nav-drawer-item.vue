<template>
  <!-- Level 1: direct link -->
  <template v-if="level === 1 && item.type !== 'submenu'">
    <v-list-item
      :title="resolveLinkTitle(item, locale)"
      :to="item.type !== 'external' ? resolveLink(item) : undefined"
      :href="item.type === 'external' ? item.href : undefined"
      :target="item.type === 'external' ? '_blank' : undefined"
      :rel="item.type === 'external' ? 'noopener' : undefined"
      :active="isItemActive(item)"
    />
  </template>

  <!-- Level 1: group with subtitle -->
  <template v-else-if="level === 1 && item.type === 'submenu' && item.children?.length">
    <v-divider />
    <v-list-subheader>{{ item.title }}</v-list-subheader>
    <nav-drawer-item
      v-for="(child, i) of item.children"
      :key="`child-${i}`"
      :item="child"
      :level="2"
    />
    <v-divider />
  </template>

  <!-- Level 2+: direct link -->
  <template v-else-if="level >= 2 && item.type !== 'submenu'">
    <v-list-item
      :title="resolveLinkTitle(item, locale)"
      :to="item.type !== 'external' ? resolveLink(item) : undefined"
      :href="item.type === 'external' ? item.href : undefined"
      :target="item.type === 'external' ? '_blank' : undefined"
      :rel="item.type === 'external' ? 'noopener' : undefined"
      :active="isItemActive(item)"
    />
  </template>

  <!-- Level 2+: collapsible/expandable group -->
  <template v-else-if="level >= 2 && item.type === 'submenu' && item.children?.length">
    <v-list-group
      v-model="isGroupOpen"
      :value="item.title"
    >
      <template #activator="{ props: activatorProps }">
        <v-list-item
          v-bind="activatorProps"
          :title="item.title"
          :active="isItemActive(item)"
        />
      </template>
      <nav-drawer-item
        v-for="(child, i) of item.children"
        :key="`child-${i}`"
        :item="child"
        :level="level + 1"
      />
    </v-list-group>
  </template>
</template>

<script setup lang="ts">
import type { MenuItem } from '#api/types/portal'

const props = defineProps<{
  item: MenuItem
  level: number
}>()

const route = useRoute()
const { locale } = useI18n()
const { isMenuItemActive, resolveLink, resolveLinkTitle } = useNavigationStore()

/** Check if the given item is active based on the current route */
function isItemActive (item: MenuItem): boolean {
  return isMenuItemActive(item, route.path)
}

// For submenu groups at level 2+, track if they should be open
const isGroupOpen = ref(false)

// Watch for changes in active state and open the group if an item inside is active
watch(() => isItemActive(props.item), (active) => {
  if (props.item.type === 'submenu' && props.level >= 2 && active) {
    isGroupOpen.value = true
  }
}, { immediate: true })

</script>
