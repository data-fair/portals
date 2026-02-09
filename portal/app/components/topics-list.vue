<template>
  <v-row
    v-if="topics.length"
    :justify="config?.centered ? 'center' : undefined"
    dense
  >
    <v-col
      v-for="topic in topics"
      :key="topic.id"
      cols="auto"
    >
      <!--
        :to => redirect to the dataset page
        :link => disable hover effect when not used as link nor filter
        :variant => flat when selected, outlined when not
        :style => surface background + consistent border width
        label => use default button rounding, not default chip rounding
        @click => toggle selection in query param
      -->
      <v-chip
        :color="resolvedColor(topic.color)"
        :density="config?.density"
        :elevation="config?.elevation"
        :rounded="config?.rounded"
        :link="isFilters || !!link"
        :to="(!preview && link && !isExternalLink(link)) ? `${resolveLink(link)}?topics=${topic.id}` : undefined"
        :variant="chipVariant(topic.id)"
        :style="chipStyle(topic.id, topic.color)"
        label
        @click="toggle(topic.id)"
      >
        <v-icon
          v-if="config?.showIcon && (topic.icon?.svgPath || topic.icon?.svg)"
          :color="resolvedIconColor(topic.id, topic.color)"
          :icon="topic.icon?.svgPath || extractSvgPath(topic.icon?.svg)"
          start
        />
        <!-- text-truncate enables text overflow with ellipsis (...) when chip width exceeds available space -->
        <span class="text-truncate">{{ topic.title }} {{ topic.count !== undefined ? `(${topic.count})` : '' }}</span>
      </v-chip>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { TopicsElement } from '#api/types/page-config'
import type { LinkItem } from '#api/types/page-elements/index.ts'

const { preview } = usePortalStore()
const { isExternalLink, resolveLink } = useNavigationStore()
const selected = useStringsArraySearchParam('topics')

const { isFilters, config } = defineProps<{
  topics: {
    id: string
    title: string
    count?: number
    color?: string
    icon?: {
      svg?: string
      svgPath?: string
    }
  }[]
  link?: LinkItem
  isFilters?: boolean
  centered?: boolean
  config?: Pick<TopicsElement, 'color' | 'elevation' | 'density' | 'rounded' | 'centered' | 'showIcon' | 'iconColor'>
}>()

// Toggle selection in the topics query param when filters are enabled.
const toggle = (id: string) => {
  if (!isFilters) return
  if (selected.value.includes(id)) selected.value = selected.value.filter(x => x !== id)
  else selected.value = [...selected.value, id]
}

// Selection is only meaningful when used as filters.
const isSelected = (id: string): boolean => isFilters && selected.value.includes(id)

/*
 * Base Vuetify behavior:
 * - Selected: variant flat, chip uses resolved color.
 * - Not selected: variant outlined with surface background.
 */
const chipVariant = (topicId: string) => (isSelected(topicId) ? 'flat' : 'outlined')

// Keep surface background and consistent width (by adding transparent border) when not selected.
const chipStyle = (topicId: string, topicColor?: string): Record<string, string> | undefined => {
  if (isSelected(topicId)) return { border: '1px solid transparent' }

  const style: Record<string, string> = { backgroundColor: 'rgb(var(--v-theme-surface))' }
  if (!resolvedColor(topicColor)) style.color = 'rgb(var(--v-theme-on-surface))'
  return style
}

/**
 * No color configured => use default chip color.
 * 'default' => use topic color
 * Any other value => use configured color.
 */
const resolvedColor = (topicColor?: string): string | undefined => {
  if (!config?.color) return undefined
  return config.color === 'default' ? topicColor : config.color
}

/**
 * No icon color configured => use chip color (default behavior).
 * 'default' => use topic color
 * Any other value => use configured color.
 *
 * Default text color if selected
 */
const resolvedIconColor = (topicId: string, topicColor?: string): string | undefined => {
  if (isSelected(topicId)) return undefined
  if (!config?.iconColor) return undefined
  return config.iconColor === 'default' ? topicColor : config.iconColor
}

/** Extract path data from SVG string when svgPath is missing. */
const extractSvgPath = (svg?: string): string | undefined => {
  if (!svg) return
  const match = svg.match(/<path[^>]*d="([^"]+)"/)
  return match ? match[1] : undefined
}

</script>

<style scoped>
/* Without this, .text-truncate class would have no effect. */
:deep(.v-chip__content) {
  max-width: 100%;
}
</style>
