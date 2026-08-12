<template>
  <!-- Level 1: direct link -->
  <template v-if="level === 1 && item.type !== 'submenu'">
    <li v-if="showDivider">
      <v-divider />
    </li>
    <li>
      <v-list-item
        :to="!isExternalLink(item) ? resolveLink(item) : undefined"
        :href="isExternalLink(item) ? resolveLink(item) : undefined"
        :target="item.type === 'external' && item.target ? '_blank' : undefined"
        :rel="item.type === 'external' && item.target ? 'noopener' : undefined"
        :active="isActive"
        :role="undefined"
        tabindex="0"
      >
        <template #prepend>
          <v-icon
            v-if="item.icon && (item.icon.mdi?.svgPath || item.icon.custom)"
            :icon="item.icon.mdi?.svgPath || item.icon.custom"
            :color="item.icon.color"
          />
        </template>
        <!-- text-wrap lets long titles wrap instead of being truncated -->
        <v-list-item-title class="text-wrap">
          {{ resolveLinkTitle(item, locale) }}
        </v-list-item-title>
      </v-list-item>
    </li>
  </template>

  <!-- Level 1: group with subtitle -->
  <template v-else-if="level === 1 && item.type === 'submenu' && item.children?.length">
    <li v-if="showDivider">
      <v-divider />
    </li>
    <li>
      <v-list-subheader>
        <span class="d-flex align-center">
          <v-icon
            v-if="item.icon"
            :icon="item.icon.mdi?.svgPath || item.icon.custom"
            :color="item.icon.color"
            class="mr-2"
          />
          {{ item.title }}
        </span>
      </v-list-subheader>
    </li>
    <nav-drawer-item
      v-for="(child, i) of item.children"
      :key="`child-${i}`"
      :item="child"
      :level="2"
    />
  </template>

  <!-- Level 2+: direct link -->
  <template v-else-if="level >= 2 && item.type !== 'submenu'">
    <li>
      <v-list-item
        :to="!isExternalLink(item) ? resolveLink(item) : undefined"
        :href="isExternalLink(item) ? resolveLink(item) : undefined"
        :target="item.type === 'external' && item.target ? '_blank' : undefined"
        :rel="item.type === 'external' && item.target ? 'noopener' : undefined"
        :active="isActive"
        :role="undefined"
        tabindex="0"
      >
        <template #prepend>
          <v-icon
            v-if="item.icon && (item.icon.mdi?.svgPath || item.icon.custom)"
            :icon="item.icon.mdi?.svgPath || item.icon.custom"
            :color="item.icon.color"
          />
        </template>
        <!-- text-wrap lets long titles wrap instead of being truncated -->
        <v-list-item-title class="text-wrap">
          {{ resolveLinkTitle(item, locale) }}
        </v-list-item-title>
      </v-list-item>
    </li>
  </template>

  <!-- Level 2+: collapsible/expandable group -->
  <template v-else-if="level >= 2 && item.type === 'submenu' && item.children?.length">
    <li>
      <v-list-group
        v-model="isGroupOpen"
        :value="item.title"
      >
        <template #activator="{ props: activatorProps }">
          <!-- disclosure toggle for the collapsible group -->
          <v-list-item
            v-bind="activatorProps"
            :active="isActive"
            :aria-expanded="isGroupOpen"
            role="button"
            tabindex="0"
          >
            <template #prepend>
              <v-icon
                v-if="item.icon && (item.icon.mdi?.svgPath || item.icon.custom)"
                :icon="item.icon.mdi?.svgPath || item.icon.custom"
                :color="item.icon.color"
              />
            </template>
            <!-- text-wrap lets long titles wrap instead of being truncated -->
            <v-list-item-title class="text-wrap">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </template>
        <ul style="margin: 0; padding: 0; list-style: none">
          <nav-drawer-item
            v-for="(child, i) of item.children"
            :key="`child-${i}`"
            :item="child"
            :level="level + 1"
          />
        </ul>
      </v-list-group>
    </li>
  </template>
</template>

<script setup lang="ts">
import type { MenuItem } from '#api/types/portal'

const props = defineProps<{
  item: MenuItem
  level: number
  showDivider?: boolean
}>()

const route = useRoute()
const { locale } = useI18n()
const { isMenuItemActive, isExternalLink, resolveLink, resolveLinkTitle } = useNavigationStore()

const isActive = computed(() => isMenuItemActive(props.item, route.path))

// For submenu groups at level 2+, track if they should be open
const isGroupOpen = ref(false)

// Automatically open the group if an item inside is active
watch(isActive, (active) => {
  if (props.item.type === 'submenu' && props.level >= 2 && active) {
    isGroupOpen.value = true
  }
}, { immediate: true })

</script>
