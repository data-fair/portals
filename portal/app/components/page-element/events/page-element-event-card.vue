<template>
  <event-card
    v-if="eventPage"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :page="eventPage"
    :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.events.card"
    :is-portal-config="element.usePortalConfig || !element.cardConfig"
  />
</template>

<script setup lang="ts">
import type { Page } from '#api/types/page'
import type { EventCardElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps<{ element: EventCardElement }>()
const { portalConfig, preview } = usePortalStore()

let eventPage: Ref<Pick<Page, '_id' | 'type' | 'config' | 'updatedAt'> | null | undefined>
if (!preview) {
  const eventFetch = useFetch<Page>(() => element.event?.slug ? '/portal/api/pages/event/' + element.event.slug : '', { immediate: false })
  eventPage = eventFetch.data
  watch(() => element.event?.slug, (slug) => {
    if (slug) eventFetch.refresh()
  }, { immediate: true })
} else {
  eventPage = ref({
    _id: 'event-preview',
    type: 'event' as const,
    config: {
      title: element.event?.title || 'Événement 1',
      description: "Exemple d'événement pour la prévisualisation.",
      elements: [],
      eventMetadata: { slug: element.event?.slug || 'event-1', startDate: new Date().toISOString() }
    },
    updatedAt: new Date().toISOString()
  })
}
</script>
