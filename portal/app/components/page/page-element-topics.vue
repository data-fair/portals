<!-- eslint-disable vue/no-v-html -->
<template>
  <topics-list
    v-if="topicsItems"
    :topics="topicsItems"
    :config="element"
  />
</template>

<script setup lang="ts">
import type { Topics } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Topics, required: true }
})

const { portal, preview } = usePortalStore()

type TopicItem = {
  id: string
  title: string
  count: number
  color: string
  icon?: {
    svgPath: string
  }
}

let topicsItems: TopicItem[] | ComputedRef<TopicItem[]>

if (!preview) {
  const datasetsFetch = useLocalFetch<{
    facets: {
      topics: {
        value: {
          id: string
          title: string
          color: string
          icon?: {
            svgPath: string
          }
        },
        count: number
      }[]
    }
  }>('/data-fair/api/v1/datasets', {
    query: {
      facets: 'topics',
      size: 0,
      publicationSites: 'data-fair-portals:' + portal.value._id,
    }
  })
  topicsItems = computed(() => datasetsFetch.data.value?.facets.topics.map(facet => ({ ...facet.value, count: facet.count })) || [])
} else {
  topicsItems = [
    { id: 'topic-1', title: 'Topic 1', count: 10, color: '#0000FF' },
    { id: 'topic-2', title: 'Topic 2', count: 5, color: '#FF0000' },
    { id: 'topic-3', title: 'Topic 3', count: 8, color: '#008000' }
  ]
}

</script>
