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
      <v-chip
        :variant="!isFilters || !selected.includes(topic.id) ? 'outlined' : undefined"
        :color="!isFilters || selected.includes(topic.id) ? (config?.color === 'default' ? topic.color
          : config?.color ? config.color
          : undefined
        ) : undefined
        "
        :density="config?.density"
        :elevation="config?.elevation"
        :rounded="config?.rounded"
        :to="isLinks && !preview ? `/datasets?topics=${topic.id}` : undefined"
        label
        @click="isFilters ? toggle(topic.id) : undefined"
      >
        <v-icon
          v-if="config?.showIcon && (topic.icon?.svgPath || topic.icon?.svg)"
          :color="!isFilters || selected.includes(topic.id) ? undefined
            : (config?.iconColor === 'default' ? topic.color
              : config?.iconColor ? config.iconColor
              : config?.color === 'default' ? topic.color
              : config?.color ? config.color
              : undefined
            )
          "
          :icon="topic.icon?.svgPath || extractSvgPath(topic.icon?.svg)"
          start
        />
        <span class="text-truncate">{{ topic.title }} {{ topic.count !== undefined ? `(${topic.count})` : '' }}</span>
      </v-chip>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { TopicsElement } from '#api/types/page-config'

const { preview } = usePortalStore()
const selected = useStringsArraySearchParam('topics')

const { topics } = defineProps<{
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
  isLinks?: boolean
  isFilters?: boolean
  centered?: boolean
  config?: Pick < TopicsElement, 'color' | 'elevation' | 'density' | 'rounded' | 'centered' | 'showIcon' | 'iconColor'>
}>()

const toggle = (id: string) => {
  if (selected.value.includes(id)) selected.value = selected.value.filter(x => x !== id)
  else selected.value = [...selected.value, id]
}

function extractSvgPath (svg?: string): string | undefined {
  if (!svg) return
  const match = svg.match(/<path[^>]*d="([^"]+)"/)
  return match ? match[1] : undefined
}

</script>

<style scoped>
/* Set a background color for outlined chips */
:deep(.v-chip--variant-outlined) {
  background-color: var(--v-theme-surface);
}

/* Allow to truncate text */
:deep(.v-chip__content) {
  max-width: 100%;
}
</style>
