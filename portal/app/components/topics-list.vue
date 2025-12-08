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
      <div class="bg-surface">
        <v-chip
          :variant="!selected.includes(topic.id) ? 'outlined' : undefined"
          :color="config?.color === 'default' ? topic.color
            : config?.color ? config.color
            : undefined
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
            :color="!selected.includes(topic.id) ? (config?.iconColor === 'default' ? topic.color
                : config?.iconColor ? config.iconColor
                : config?.color === 'default' ? topic.color
                : config?.color ? config.color
                : undefined
              ) : undefined
            "
            :icon="topic.icon?.svgPath || extractSvgPath(topic.icon?.svg)"
            start
          />
          {{ topic.title }} {{ topic.count !== undefined ? `(${topic.count})` : '' }}
        </v-chip>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { TopicsElement } from '#api/types/page-config'

const { preview } = usePortalStore()

const selected = defineModel({
  type: Array as () => string[],
  default: () => []
})

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
