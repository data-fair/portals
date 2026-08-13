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
        :link => interactive (overlay/ripple) when link or filter; the background hover effect is excluded in filter mode, where 'invert' takes over
        :role/:aria-pressed => a filter chip has no href, so VChip renders a bare <span tabindex="0">: assistive technologies would announce neither a control nor its selection, which the fill alone carries (RGAA 7.1)
        :variant => flat when selected, outlined when not, flipped on hover with the 'invert' effect
        :style => surface background + consistent border width
        label => use default button rounding, not default chip rounding
        @click => toggle selection in query param
      -->
      <v-hover
        v-slot="{ isHovering, props: hoverProps }"
        :disabled="!hoverInteractive"
      >
        <v-chip
          v-bind="hoverProps"
          :color="resolvedColor(topic.color)"
          :density="config?.density ?? portalConfig.defaults?.density"
          :elevation="hoverFx.elevation(isHovering, config?.elevation ?? portalConfig.defaults?.elevation)"
          :rounded="config?.rounded ?? portalConfig.defaults?.rounded"
          :link="isFilters || !!link"
          :to="(!preview && link && !isExternalLink(link)) ? `${resolveLink(link)}?topics=${topic.id}` : undefined"
          :role="isFilters ? 'button' : undefined"
          :aria-pressed="isFilters ? String(isSelected(topic.id)) : undefined"
          :variant="chipVariant(topic.id, isHovering)"
          :style="[chipStyle(topic.id, topic.color, isHovering), chipHoverStyle(topic, isHovering)]"
          label
          @click="toggle(topic.id)"
        >
          <v-icon
            v-if="config?.showIcon && (topic.icon?.svgPath || topic.icon?.svg)"
            :color="resolvedIconColor(topic.id, topic.color, isHovering)"
            :icon="topic.icon?.svgPath || extractSvgPath(topic.icon?.svg)"
            start
          />
          <!-- text-truncate enables text overflow with ellipsis (...) when chip width exceeds available space -->
          <span class="text-truncate">{{ topic.title }} {{ topic.count !== undefined ? `(${topic.count})` : '' }}</span>
        </v-chip>
      </v-hover>
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
// As filters, chips already encode selection through their fill, so filling them on hover
// would clash: 'invert' flips that fill instead, which doubles as the toggle feedback.
const filterEffects: HoverEffect[] = ['darken', 'elevate', 'grow', 'border', 'invert']
// The reserved border can't match a tonal background, so exclude the border effect there.
const relevantEffects = computed<HoverEffect[]>(() => {
  if (isFilters) return filterEffects
  return config?.variant === 'tonal' ? chipEffects.filter(e => e !== 'border') : chipEffects
})
const hoverFx = useHoverConfig(() => config?.hover, relevantEffects)

const hoverInteractive = computed(() => isFilters || !!link)

// The 'default' hover color means each topic's own color (raw CSS color, not a theme name).
const chipHoverStyle = (topic: { id: string, color?: string }, isHovering: boolean | null): Record<string, string> | undefined => {
  if (!hoverInteractive.value) return undefined
  const outlined = chipVariant(topic.id, isHovering) === 'outlined'
  const { effects, color } = hoverFx.resolved.value
  const style = hoverFx.rootStyle(isHovering, { hasBorder: outlined || isFilters, inlineBackground: true, small: true })
  if (style && color === 'default') {
    const topicColor = topic.color ?? 'rgb(var(--v-theme-primary))'
    if (style.borderColor) style.borderColor = topicColor
    if (style.backgroundColor) {
      style.backgroundColor = topicColor
      delete style.color
    }
  }
  // An outlined chip draws its border from currentColor, which the fill's text color would
  // drag along: pin it back to the resting color unless 'border' is meant to repaint it.
  if (style && outlined && effects.includes('background') && !effects.includes('border')) {
    style.borderColor = restingColor(topic.color)
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

// The 'invert' effect swaps the fill of the hovered chip: an inactive filter looks selected,
// an active one looks unselected, which previews what the click is about to do.
const isInverted = (isHovering: boolean | null) => !!isHovering && hoverFx.resolved.value.effects.includes('invert')

/*
 * Variant behavior:
 * - If filters: use selection behavior (selected=flat, not selected=outlined), inverted on hover.
 * - If config.variant === 'default': use undefined (Vuetify default).
 * - Otherwise: use configured variant.
 */
const chipVariant = (topicId: string, isHovering: boolean | null) => {
  if (isFilters) return isSelected(topicId) !== isInverted(isHovering) ? 'flat' : 'outlined'
  if (!config?.variant || config.variant === 'default') return 'flat'
  return config.variant
}

// Keep surface background on outlined chips, and consistent width (by adding transparent border)
// on the filled ones they sit next to when filters are enabled.
const chipStyle = (topicId: string, topicColor: string | undefined, isHovering: boolean | null): Record<string, string> | undefined => {
  if (chipVariant(topicId, isHovering) !== 'outlined') return isFilters ? { border: '1px solid transparent' } : undefined

  const style: Record<string, string> = { backgroundColor: 'rgb(var(--v-theme-surface))' }
  if (!resolvedColor(topicColor)) style.color = 'rgb(var(--v-theme-on-surface))'
  return style
}

/** The CSS color a chip shows at rest, which its outlined border inherits through currentColor. */
const restingColor = (topicColor?: string): string => {
  const color = resolvedColor(topicColor)
  if (!color) return 'rgb(var(--v-theme-on-surface))'
  return config?.color === 'default' ? color : `rgb(var(--v-theme-${color}))`
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
 * A filled filter chip keeps the contrast color Vuetify computes for its content.
 */
const resolvedIconColor = (topicId: string, topicColor: string | undefined, isHovering: boolean | null): string | undefined => {
  if (isFilters && chipVariant(topicId, isHovering) !== 'outlined') return undefined
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
