<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    v-if="topicsItems.length"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
  >
    <topics-list
      :config="element"
      :topics="topicsItems"
      is-links
    />
  </div>
</template>

<script setup lang="ts">
import type { TopicsElement } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => TopicsElement, required: true }
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
        value: Omit<TopicItem, 'count'>,
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
