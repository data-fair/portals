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
        @click => toggle selection in query param
        :link => disable hover effect when not used as link nor filter
        variant => always flat, we determine the color, background color and outline ourselves
        :style => override default border color with calculated one
        border => force border style like outlined variant
        label => use default button rounding, not default chip rounding
      -->
      <v-chip
        :color="chipColor(topic.id, topic.color)"
        :density="config?.density"
        :elevation="config?.elevation"
        :rounded="config?.rounded"
        :link="isFilters || !!link"
        :to="(!preview && link && !isExternalLink(link)) ? `${resolveLink(link)}?topics=${topic.id}` : undefined"
        :style="{ '--v-border-color': borderColor(topic.color) }"
        border="sm opacity-100"
        variant="flat"
        label
        @click="toggle(topic.id)"
      >
        <v-icon
          v-if="config?.showIcon && (topic.icon?.svgPath || topic.icon?.svg)"
          :color="iconColor(topic.id, topic.color, config?.iconColor)"
          :icon="topic.icon?.svgPath || extractSvgPath(topic.icon?.svg)"
          start
        />
        <!-- text-truncate enables text overflow with ellipsis (...) when chip width exceeds available space -->
        <span class="text-truncate" :style="{ color: textColor(topic.id, topic.color) }">{{ topic.title }} {{ topic.count !== undefined ? `(${topic.count})` : '' }}</span>
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
  config?: Pick < TopicsElement, 'color' | 'elevation' | 'density' | 'rounded' | 'centered' | 'showIcon' | 'iconColor'>
}>()

const toggle = (id: string) => {
  if (!isFilters) return
  if (selected.value.includes(id)) selected.value = selected.value.filter(x => x !== id)
  else selected.value = [...selected.value, id]
}

const isSelected = (id: string): boolean => isFilters && selected.value.includes(id)

/*
 * Color is based on `config.color`:
 * - undefined: use Vuetify defaults (Vuetify adapts color based on background).
 * - 'default': use the topic's specific color (hexa).
 * - other: use the specified theme color ('primary', 'secondary', 'accent').
 */

/** Background color of the chip : colored when selected, surface when not */
const chipColor = (topicId: string, topicColor?: string): string | undefined => {
  if (isSelected(topicId)) {
    if (config?.color) return config.color === 'default' ? topicColor : config.color
    return undefined
  }
  return 'surface'
}

/** Text color of the chip: undefined when selected, colored when not */
const textColor = (topicId: string, topicColor?: string): string | undefined => {
  if (isSelected(topicId)) return undefined
  if (config?.color) return config.color === 'default' ? topicColor : `rgba(var(--v-theme-${config.color}))`
  return undefined
}

/**
 * Border color of the chip: always colored.
 * Note: Returns an RGB value to override the CSS variable which doesn't support hexa.
 */
const borderColor = (topicColor?: string): string | undefined => {
  if (config?.color) return config.color === 'default' ? hexToRgb(topicColor) : `var(--v-theme-${config.color})`
  return undefined
}

/**
 * Icon color of the chip: default when selected, colored when not
 * Note: Icon can have a different color than text, but same logic applies.
 */
const iconColor = (topicId: string, topicColor?: string, iconColor?: string): string | undefined => {
  if (isSelected(topicId)) return undefined
  if (iconColor) return iconColor === 'default' ? topicColor : iconColor
  return textColor(topicId, topicColor)
}

/** Convert hex (hexadecimal accepted for compatibility) color to RGB string */
const hexToRgb = (hex?: string): string | undefined => {
  const m = hex?.match(/^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})/i)
  if (!m) return
  const [r, g, b] = m.slice(1).map(v => v.length === 1 ? v + v : v)
  if (!r || !g || !b) return
  return `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}`
}

/** Extract path data from SVG string for compatibility if topic does not have svgPath */
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
