<template>
  <v-row
    v-if="topics.length"
    :justify="!filters ? 'center' : undefined"
  >
    <v-col
      v-for="topic in topics"
      :key="topic.id"
      cols="auto"
    >
      <v-btn
        :prepend-icon="topic.icon?.svgPath"
        :variant="!filters || !selected.includes(topic.id) ? 'outlined' : undefined"
        :color="topic.color"
        :density="config?.density"
        :elevation="config?.elevation"
        :rounded="config?.rounded"
        :to="!filters && !preview ? `/datasets?topics=${topic.id}` : undefined"
        @click="filters ? toggle(topic.id) : undefined"
      >
        {{ topic.title }} ({{ topic.count }})
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Topics } from '#api/types/page-config'

const { preview } = usePortalStore()

const selected = defineModel({
  type: Array as () => string[],
  default: () => []
})

const { topics, filters } = defineProps<{
  topics: {
    id: string
    title: string
    count: number
    color: string
    icon?: {
      svgPath: string
    }
  }[]
  filters?: boolean
  config?: Pick<Topics, 'elevation' | 'density' | 'rounded'>
}>()

const toggle = (id: string) => {
  if (selected.value.includes(id)) selected.value = selected.value.filter(x => x !== id)
  else selected.value = [...selected.value, id]
}

</script>
