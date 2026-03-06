<template>
  <v-row :class="['d-flex align-stretch', element.mb !== 0 && `mb-${element.mb ?? 4}`]">
    <v-col
      v-for="event in displayedEvents"
      :key="event._id"
      :md="12 / element.columns"
      cols="12"
    >
      <event-card
        :page="event"
        :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.events.card"
        :is-portal-config="element.usePortalConfig || !element.cardConfig"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Page } from '#api/types/page'
import type { EventListElement } from '#api/types/page-elements/index.ts'

type EventFetch = { count: number; results: Pick<Page, '_id' | 'type' | 'config' | 'updatedAt'>[] }

const { element } = defineProps<{ element: EventListElement }>()
const { portalConfig, preview } = usePortalStore()

let displayedEvents: ComputedRef<EventFetch['results']>

if (!preview) {
  const slugs = element.events?.map(e => e.slug) || []
  const eventsQuery = computed(() => ({
    slugs: element.mode === 'custom' ? slugs.join(',') : undefined,
    size: element.mode !== 'custom' ? element.limit : undefined,
    upcoming: element.mode === 'upcoming' ? 'true' : undefined,
    sort: element.mode === 'upcoming' ? 'startDate:1' : 'startDate:-1'
  }))

  const eventsFetch = useFetch<EventFetch>('/portal/api/events', { query: eventsQuery })
  displayedEvents = computed(() => {
    const results = eventsFetch.data.value?.results || []
    if (element.mode === 'custom') return [...results].sort((a, b) => slugs.indexOf(a.config.eventMetadata?.slug ?? '') - slugs.indexOf(b.config.eventMetadata?.slug ?? ''))
    return results
  })
} else {
  displayedEvents = computed(() => {
    return Array.from({ length: element.mode === 'custom' ? (element.events?.length || 1) : element.limit }, (_, i) => ({
      _id: `event-${i + 1}`,
      type: 'event' as const,
      config: {
        title: element.events?.[i]?.title || `Événement ${i + 1}`,
        description: 'Exemple d\'événement pour la prévisualisation.',
        elements: [],
        eventMetadata: { slug: element.events?.[i]?.slug || `event-${i + 1}`, startDate: new Date().toISOString() }
      },
      updatedAt: new Date().toISOString()
    }))
  })
}
</script>
