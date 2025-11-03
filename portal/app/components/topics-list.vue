<template>
  <v-row
    v-if="topics.length"
    :justify="config?.centered ? 'center' : undefined"
  >
    <v-col
      v-for="topic in topics"
      :key="topic.id"
      cols="auto"
    >
      <div class="bg-surface">
        <v-btn
          class="text-none"
          :variant="!selected.includes(topic.id) ? 'outlined' : undefined"
          :color="config?.color === 'default' ? topic.color
            : config?.color ? config.color
            : undefined
          "
          :density="config?.density"
          :elevation="config?.elevation"
          :rounded="config?.rounded"
          :to="isLinks && !preview ? `/datasets?topic=${topic.id}` : undefined"
          @click="isFilters ? toggle(topic.id) : undefined"
        >
          <template
            v-if="config?.showIcon && topic.icon?.svgPath"
            #prepend
          >
            <v-icon
              :color="!selected.includes(topic.id) ? (config?.iconColor === 'default' ? topic.color
                  : config?.iconColor ? config.iconColor
                  : config?.color === 'default' ? topic.color
                  : config?.color ? config.color
                  : undefined
                ) : undefined
              "
              :icon="topic.icon?.svgPath"
            />
          </template>
          {{ topic.title }} {{ topic.count !== undefined ? `(${topic.count})` : '' }}
        </v-btn>
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
    color: string
    icon?: {
      svgPath: string
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

</script>
