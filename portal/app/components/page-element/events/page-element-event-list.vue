<template>
  <v-row :class="['d-flex align-stretch', element.mb !== 0 && `mb-${element.mb ?? 4}`]">
    <v-col
      v-for="eventPage in displayedEvents"
      :key="eventPage.eventMetadata?.slug"
      :md="12 / element.columns"
      cols="12"
    >
      <event-card
        v-if="eventPage"
        :page-config="eventPage"
        :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.events.card"
        :is-portal-config="element.usePortalConfig || !element.cardConfig"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page-config'
import type { EventListElement } from '#api/types/page-elements/index.ts'

type EventFetch = { count: number; results: Omit<PageConfig, 'elements'>[] }

const { element } = defineProps<{ element: EventListElement }>()
const { portalConfig, preview } = usePortalStore()

let displayedEvents: ComputedRef<EventFetch['results']>

if (!preview) {
  const slugs = element.events?.map(e => e.slug) || []
  const eventsQuery = computed(() => ({
    slugs: element.mode === 'custom' ? slugs.join(',') : undefined,
    size: element.mode !== 'custom' ? element.limit : undefined,
    includePast: element.mode === 'custom' ? 'true' : undefined,
    sort: element.mode === 'upcoming' ? 'startDate:1' : undefined
  }))

  const eventsFetch = useFetch<EventFetch>('/portal/api/events', { query: eventsQuery })
  displayedEvents = computed(() => {
    const results = eventsFetch.data.value?.results || []
    if (element.mode === 'custom') return [...results].sort((a, b) => slugs.indexOf(a.eventMetadata?.slug ?? '') - slugs.indexOf(b.eventMetadata?.slug ?? ''))
    return results
  })
} else {
  displayedEvents = computed(() => {
    return Array.from({ length: element.mode === 'custom' ? (element.events?.length || 1) : element.limit }, (_, i) => ({
      title: element.events?.[i]?.title || `Événement ${i + 1}`,
      description: 'Exemple d\'événement pour la prévisualisation.',
      eventMetadata: { slug: element.events?.[i]?.slug || `event-${i + 1}`, startDate: new Date().toISOString() }
    }))
  })
}
</script>
