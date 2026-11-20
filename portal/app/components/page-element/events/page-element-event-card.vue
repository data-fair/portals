<template>
  <event-card
    v-if="eventPageConfig"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :page-config="eventPageConfig"
    :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.events.card"
    :is-portal-config="element.usePortalConfig || !element.cardConfig"
  />
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page'
import type { EventCardElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps<{ element: EventCardElement }>()
const { portalConfig, preview } = usePortalStore()

let eventPageConfig: Ref<Omit<PageConfig, 'elements'> | null | undefined>
if (!preview) {
  const eventFetch = useFetch<PageConfig>(() => element.event?.slug ? '/portal/api/pages/event/' + element.event.slug : '', { immediate: false })
  eventPageConfig = eventFetch.data
  watch(() => element.event?.slug, (slug) => {
    if (slug) eventFetch.refresh()
  }, { immediate: true })
} else {
  eventPageConfig = ref({
    title: element.event?.title || 'Lorem ipsum 1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    eventMetadata: { slug: element.event?.slug || 'event-1', startDate: new Date().toISOString() }
  })
}
</script>
