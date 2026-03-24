<template>
  <v-row class="my-0">
    <!-- Left Column: Filters (256px) -->
    <v-col
      v-if="element.filters?.items?.length && element.filters.position === 'left' && !$vuetify.display.smAndDown"
      style="max-width: 256px;"
      class="pa-0"
    >
      <catalog-filters
        :config="element"
        catalog-type="events"
        drawer
      />
    </v-col>

    <!-- Main Column -->
    <v-col>
      <!-- Count top -->
      <component
        :is="headingTag"
        v-if="element.eventCountPosition === 'top'"
        class="text-h4 mb-4"
      >
        {{ t('eventsCount', { count: eventsCount }) }}
      </component>

      <!-- Standard Filters -->
      <v-row
        v-if="element.filters?.items?.length && (element.filters.position !== 'left' || $vuetify.display.smAndDown)"
        class="my-0"
      >
        <catalog-filters
          :config="element"
          catalog-type="events"
        />
      </v-row>

      <!-- Advanced Filters slot -->
      <div v-if="element.showAdvancedFilters" class="mt-2">
        <slot
          name="page-elements"
          :on-update="(newElements: PageElement[]) => ({ ...element, advancedFilters: newElements})"
          :elements="element.advancedFilters"
          add-item-message="Ajouter un filtre (Mode avancé)"
        />
      </div>

      <!-- Count + Sort row -->
      <v-row
        v-if="element.eventCountPosition === 'bottom'"
        class="mt-2"
        align="end"
      >
        <v-col class="py-0">
          {{ t('resultsCount', { count: eventsCount }) }}
        </v-col>
        <v-col
          v-if="element.showSortBesideCount"
          cols="12"
          md="6"
          lg="4"
        >
          <v-select
            v-model="sort"
            :items="sortItems"
            :label="t('sort.by')"
            :density="element.filters?.density || 'comfortable'"
            :rounded="element.filters?.rounded"
            variant="outlined"
            hide-details
            clearable
          >
            <template #append>
              <v-btn-toggle
                v-model="order"
                :density="element.filters?.density || 'comfortable'"
                :rounded="element.filters?.rounded"
                variant="outlined"
                class="h-100"
                divided
                mandatory
              >
                <v-btn
                  :icon="mdiSortDescending"
                  :title="t('descending')"
                  value="-1"
                  stacked
                />
                <v-btn
                  :icon="mdiSortAscending"
                  :title="t('ascending')"
                  value="1"
                  stacked
                />
              </v-btn-toggle>
            </template>
          </v-select>
        </v-col>
      </v-row>

      <!-- Pagination above results -->
      <catalog-pagination
        v-if="paginationPosition === 'before' || paginationPosition === 'both'"
        :current-page="currentPage"
        :total-pages="totalPages"
        :alignment="element.pagination?.alignment"
        class="my-4"
        @update:page="goToPage"
      />

      <!-- Events grid -->
      <v-row class="d-flex align-stretch mt-2">
        <v-col
          v-for="eventPageConfig in displayedEvents"
          :key="eventPageConfig.eventMetadata?.slug"
          :md="12 / (element.columns || 2)"
          cols="12"
        >
          <event-card
            :page-config="eventPageConfig"
            :card-config="portalConfig.events.card"
            is-portal-config
          />
        </v-col>
      </v-row>

      <!-- Loading spinner -->
      <div v-if="loading" class="d-flex justify-center my-4">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- Pagination below results -->
      <catalog-pagination
        v-if="paginationPosition === 'after' || paginationPosition === 'both'"
        :current-page="currentPage"
        :total-pages="totalPages"
        :alignment="element.pagination?.alignment"
        class="my-4"
        @update:page="goToPage"
      />

      <!-- Intersection observer trigger for infinite scroll -->
      <div
        v-if="hasMore && paginationPosition === 'none'"
        v-intersect="(isIntersecting: boolean) => isIntersecting && loadMore()"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { PageConfig, PageElement } from '#api/types/page-config'
import type { EventCatalogElement } from '#api/types/page-elements/index.ts'
import { mdiSortAscending, mdiSortDescending } from '@mdi/js'

type EventFetch = { count: number; results: Omit<PageConfig, 'elements'>[] }

const { element, context } = defineProps<{
  element: EventCatalogElement
  context?: { isRoot: boolean, index: number, parentLength: number }
}>()
const { portalConfig, preview } = usePortalStore()
const { t } = useI18n()

const headingTag = computed(() => {
  let level = 1
  if (portalConfig.value.header?.show && portalConfig.value.header?.showTitle) level++
  if (context?.isRoot && context.index > 0) level++
  return `h${level}`
})

const filters = {
  search: useStringSearchParam('q'),
  includePast: useBooleanSearchParam('include-past'),
  sort: useStringSearchParam('sort', { default: element.defaultSort })
}

const sort = ref<string>()
const order = ref<'-1' | '1'>()

const paginationPosition = computed(() => element.pagination?.position || 'none')
const currentPage = ref(1)
const displayedEvents = ref<EventFetch['results']>([])
const loading = ref(false)
const pageSize = 20

let eventsFetch: ReturnType<typeof useFetch<EventFetch | undefined>> | undefined

if (!preview) {
  const eventsQuery = computed(() => {
    const query: Record<string, string | number> = {
      select: '_id,type,config,updatedAt',
      size: pageSize,
      page: currentPage.value
    }
    if (filters.search.value) query.q = filters.search.value
    if (filters.sort.value && !(filters.search.value && filters.sort.value === element.defaultSort)) query.sort = filters.sort.value
    if (filters.includePast.value || element.includePast) query.includePast = 'true'

    return query
  })
  eventsFetch = useFetch<EventFetch>('/portal/api/events', { query: eventsQuery, watch: false })
}

const hasMore = computed(() => {
  if (preview || paginationPosition.value !== 'none') return false
  return displayedEvents.value.length < (eventsFetch?.data.value?.count || 0)
})

const eventsCount = computed(() => preview ? displayedEvents.value.length : (eventsFetch?.data.value?.count || 0))

const totalPages = computed(() => {
  if (preview) return 1
  return Math.ceil((eventsFetch?.data.value?.count || 0) / pageSize)
})

const goToPage = async (page: number) => {
  if (preview || !eventsFetch) return
  loading.value = true
  try {
    currentPage.value = page
    await eventsFetch.refresh()
    if (eventsFetch.data.value?.results) {
      displayedEvents.value = [...eventsFetch.data.value.results]
    }
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (preview || loading.value || !hasMore.value || !eventsFetch || paginationPosition.value !== 'none') return
  loading.value = true
  try {
    currentPage.value++
    await eventsFetch.refresh()
    if (eventsFetch.data.value?.results) {
      displayedEvents.value.push(...eventsFetch.data.value.results)
    }
  } finally {
    loading.value = false
  }
}

if (!preview) {
  onMounted(async () => {
    await eventsFetch?.refresh()
    if (eventsFetch?.data.value?.results) {
      displayedEvents.value = [...eventsFetch.data.value.results]
    }
  })
} else {
  displayedEvents.value = Array.from({ length: 6 }, (_, i) => ({
    title: `Événement ${i + 1}`,
    description: 'Exemple d\'événement pour la prévisualisation.',
    eventMetadata: { slug: `event-${i + 1}`, startDate: new Date().toISOString() }
  }))
}

if (!preview) {
  watch([filters.search, filters.includePast, filters.sort], async () => {
    currentPage.value = 1
    await eventsFetch?.refresh()
    if (eventsFetch?.data.value?.results) {
      displayedEvents.value = [...eventsFetch.data.value.results]
    }
  })
}

watch([sort, order], () => {
  const field = sort.value || 'startDate'
  const ord = order.value || '-1'
  filters.sort.value = `${field}:${ord}`
})

const sortItems = [
  { title: t('sort.title'), value: 'title' },
  { title: t('sort.startDate'), value: 'startDate' }
]
</script>

<i18n lang="yaml">
  en:
    eventsCount: 'No event | {count} event | {count} events'
    resultsCount: 'No result | {count} result | {count} results'
    ascending: Ascending order
    descending: Descending order
    sort:
      by: Sort by
      title: Alphabetical order
      startDate: Start date
  fr:
    eventsCount: "Aucun événement | {count} événement | {count} événements"
    resultsCount: 'Aucun résultat | {count} résultat | {count} résultats'
    ascending: Ordre croissant
    descending: Ordre décroissant
    sort:
      by: Trier par
      title: Ordre alphabétique
      startDate: Date de début
</i18n>
