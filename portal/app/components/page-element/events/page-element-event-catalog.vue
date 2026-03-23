<template>
  <catalog-layout
    catalog-type="events"
    :element="element"
    :context="context"
    :count-label="t('eventsCount', { count: itemsCount })"
    :displayed-items="displayedItems"
    :loading="loading"
    :current-page="currentPage"
    :total-pages="totalPages"
    :items-count="itemsCount"
    :sort="sort"
    :order="order"
    :sort-items="sortItems"
    @go-to-page="goToPage"
    @load-more="loadMore(element.pagination?.position)"
    @update:sort="(v) => sort = v"
    @update:order="(v) => order = v"
  >
    <template #item-card="{ item }">
      <event-card
        :page-config="item"
        :card-config="portalConfig.events.card"
        is-portal-config
      />
    </template>
    <template #page-elements="slotProps">
      <slot name="page-elements" v-bind="slotProps" />
    </template>
  </catalog-layout>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page-config'
import type { EventCatalogElement } from '#api/types/page-elements/index.ts'

interface EventFilters {
  search: ReturnType<typeof useStringSearchParam>
  includePast: ReturnType<typeof useBooleanSearchParam>
}

const { element, context } = defineProps<{
  element: EventCatalogElement
  context?: { isRoot: boolean, index: number, parentLength: number }
}>()
const { portalConfig } = usePortalStore()
const { t } = useI18n()

const {
  displayedItems, itemsCount, loading, currentPage, totalPages,
  sort, order, goToPage, loadMore
} = useCatalog<Omit<PageConfig, 'elements'>, EventFilters>(element, {
  endpoint: '/portal/api/events',
  defaultSortFallback: 'startDate:-1',
  filterDefs: () => ({
    search: useStringSearchParam('q'),
    includePast: useBooleanSearchParam('include-past')
  }),
  buildQuery: (filters, sortValue, page, pageSize) => {
    const query: Record<string, string | number> = {
      select: '_id,type,config,updatedAt',
      size: pageSize,
      page
    }
    if (filters.search.value) query.q = filters.search.value
    if (sortValue) query.sort = sortValue
    if (filters.includePast.value || element.includePast) query.includePast = 'true'
    return query
  },
  mockDataFactory: () => Array.from({ length: 6 }, (_, i) => ({
    title: `Événement ${i + 1}`,
    description: 'Exemple d\'événement pour la prévisualisation.',
    eventMetadata: { slug: `event-${i + 1}`, startDate: new Date().toISOString() }
  }))
})

const sortItems = [
  { title: t('sort.title'), value: 'title' },
  { title: t('sort.startDate'), value: 'startDate' }
]
</script>

<i18n lang="yaml">
  en:
    eventsCount: 'No event | {count} event | {count} events'
    sort:
      title: Alphabetical order
      startDate: Start date
  fr:
    eventsCount: "Aucun événement | {count} événement | {count} événements"
    sort:
      title: Ordre alphabétique
      startDate: Date de début
</i18n>
