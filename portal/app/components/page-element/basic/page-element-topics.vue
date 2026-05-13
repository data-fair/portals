<template>
  <div
    v-if="topicsItems.length"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
  >
    <topics-list
      :config="element"
      :topics="topicsItems"
      :link="redirectPage ? {
        type: 'standard',
        subtype: modes[0]
      } : undefined"
      :is-filters="!redirectPage"
    />
  </div>
</template>

<script setup lang="ts">
import type { TopicsElement } from '#api/types/page-elements/index.ts'
import { mdiHome, mdiBook } from '@mdi/js'

type TopicMode = 'datasets' | 'applications'

const { element } = defineProps({
  element: { type: Object as () => TopicsElement, required: true }
})

const modes = computed<[TopicMode, ...TopicMode[]]>(() => element.mode ?? ['datasets'])

// Redirection only makes sense with a single source: when multiple modes are selected
// the option is hidden in the editor, but we also enforce it at runtime in case the
// config was patched via the API with redirectPage=true and several modes.
const redirectPage = computed(() => !!element.redirectPage && modes.value.length === 1)

const { portal, preview } = usePortalStore()

type TopicItem = {
  id: string
  title: string
  count: number
  color?: string
  icon?: {
    svg?: string
    svgPath?: string
  }
}

let topicsItems: TopicItem[] | ComputedRef<TopicItem[]>

if (!preview) {
  const fetches = modes.value.map(m => useLocalFetch<{
    facets: {
      topics: {
        value: Omit<TopicItem, 'count'>,
        count: number
      }[]
    }
  }>(`/data-fair/api/v1/${m}`, {
    query: {
      facets: 'topics',
      size: 0,
      publicationSites: 'data-fair-portals:' + portal.value._id,
    }
  }))
  topicsItems = computed(() => {
    // Merge topics from every source, summing counts for topics that appear in several catalogs.
    const merged = new Map<string, TopicItem>()
    for (const fetch of fetches) {
      for (const facet of fetch.data.value?.facets.topics ?? []) {
        const existing = merged.get(facet.value.id)
        if (existing) existing.count += facet.count
        else merged.set(facet.value.id, { ...facet.value, count: facet.count })
      }
    }
    return Array.from(merged.values())
  })
} else {
  topicsItems = [
    { id: 'topic-1', title: 'Topic 1', count: 10, icon: { svgPath: mdiHome } },
    { id: 'topic-2', title: 'Topic 2', count: 5, color: '#A0F' },
    { id: 'topic-3', title: 'Topic 3', count: 8, color: '#080', icon: { svgPath: mdiBook } }
  ]
}

</script>
