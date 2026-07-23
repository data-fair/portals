<template>
  <v-row
    v-if="topics.length"
    :justify="config?.centered ? 'center' : undefined"
    density="compact"
  >
    <v-col
      v-for="topic in topics"
      :key="topic.id"
      cols="auto"
    >
      <!--
        :to => redirect to the dataset page
        :link => interactive (overlay/ripple) when link or filter; color-based hover effects (background/border) are excluded in filter mode
        :variant => flat when selected, outlined when not
        :style => surface background + consistent border width
        label => use default button rounding, not default chip rounding
        @click => toggle selection in query param
      -->
      <v-chip
        :color="resolvedColor(topic.color)"
        :density="config?.density ?? portalConfig.defaults?.density"
        :elevation="hoverFx.elevation(isHovering(topic.id), config?.elevation ?? portalConfig.defaults?.elevation)"
        :rounded="config?.rounded ?? portalConfig.defaults?.rounded"
        :link="isFilters || !!link"
        :to="(!preview && link && !isExternalLink(link)) ? `${resolveLink(link)}?topics=${topic.id}` : undefined"
        :variant="chipVariant(topic.id)"
        :style="[chipStyle(topic.id, topic.color), chipHoverStyle(topic, isHovering(topic.id))]"
        label
        @click="toggle(topic.id)"
        @mouseenter="hoveredTopic = topic.id"
        @mouseleave="hoveredTopic = undefined"
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
import type { TopicsElement, LinkItem } from '#api/types/page-elements/index.ts'
import type { HoverEffect } from '../utils/hover'

const { portalConfig, preview } = usePortalStore()
const { isExternalLink, resolveLink } = useNavigationStore()
const selected = useStringsArraySearchParam('topics')

const { isFilters, config, link } = defineProps<{
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
  config?: Pick<TopicsElement, 'color' | 'elevation' | 'density' | 'rounded' | 'centered' | 'showIcon' | 'iconColor' | 'hover'> & { variant?: 'default' | 'tonal' | 'outlined' }
}>()

const chipEffects: HoverEffect[] = ['darken', 'elevate', 'background', 'border', 'grow']
// As filters, chips encode selection through color, so color-based effects would
// clash: keep only the color-neutral ones.
const filterEffects: HoverEffect[] = ['darken', 'elevate', 'grow']
// The reserved border can't match a tonal background, so exclude the border effect there.
const relevantEffects = computed<HoverEffect[]>(() => {
  if (isFilters) return filterEffects
  return config?.variant === 'tonal' ? chipEffects.filter(e => e !== 'border') : chipEffects
})
const hoverFx = useHoverConfig(() => config?.hover, relevantEffects)

const hoverInteractive = computed(() => isFilters || !!link)

// per-chip hover state, see useHoverState for why VHover is not used
const hoveredTopic = ref<string>()
const isHovering = (id: string) => hoverInteractive.value && hoveredTopic.value === id

// The 'default' hover color means each topic's own color (raw CSS color, not a theme name).
const chipHoverStyle = (topic: { id: string, color?: string }, isHovering: boolean | null): Record<string, string> | undefined => {
  if (!hoverInteractive.value) return undefined
  const style = hoverFx.rootStyle(isHovering, { hasBorder: chipVariant(topic.id) === 'outlined' || isSelected(topic.id), inlineBackground: true, small: true })
  if (style && hoverFx.resolved.value.color === 'default') {
    const topicColor = topic.color ?? 'rgb(var(--v-theme-primary))'
    if (style.borderColor) style.borderColor = topicColor
    if (style.backgroundColor) {
      style.backgroundColor = topicColor
      delete style.color
    }
  }
  return style
}

// Toggle selection in the topics query param when filters are enabled.
const toggle = (id: string) => {
  if (!isFilters) return
  if (selected.value.includes(id)) selected.value = selected.value.filter(x => x !== id)
  else selected.value = [...selected.value, id]
}

// Selection is only meaningful when used as filters.
const isSelected = (id: string): boolean => isFilters && selected.value.includes(id)

/*
 * Variant behavior:
 * - If filters: use selection behavior (selected=flat, not selected=outlined).
 * - If config.variant === 'default': use undefined (Vuetify default).
 * - Otherwise: use configured variant.
 */
const chipVariant = (topicId: string) => {
  if (isFilters) return isSelected(topicId) ? 'flat' : 'outlined'
  if (!config?.variant || config.variant === 'default') return 'flat'
  return config.variant
}

// Keep surface background and consistent width (by adding transparent border) when filters are enabled and not selected.
const chipStyle = (topicId: string, topicColor?: string): Record<string, string> | undefined => {
  if (isSelected(topicId)) return { border: '1px solid transparent' }
  if (chipVariant(topicId) !== 'outlined') return undefined

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
