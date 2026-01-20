<template>
  <v-row class="my-0">
    <!-- Left Column: Filters (256px) -->
    <v-col
      v-if="element.filters?.items?.length && element.filters.position === 'left' && !$vuetify.display.smAndDown"
      style="max-width: 256px;"
      class="pa-0"
    >
      <catalog-filters
        :config="element as any"
        catalog-type="applications"
        drawer
      />
    </v-col>

    <!-- Main Column: Main Content -->
    <v-col>
      <!-- Page Title / Count -->
      <component
        :is="headingTag"
        v-if="element.reusesCountPosition === 'top'"
        class="text-h4 mb-4"
      >
        {{ t('reusesCount', { count: reusesCount }) }}
      </component>

      <!-- Standard Filters (only search + sort supported for now) -->
      <v-row
        v-if="element.filters?.items?.length && (element.filters.position !== 'left' || $vuetify.display.smAndDown)"
        class="my-0"
      >
        <catalog-filters
          :config="element as any"
          catalog-type="applications"
        />
      </v-row>

      <!-- Advanced Filters slot -->
      <div
        v-if="element.showAdvancedFilters"
        class="mt-2"
      >
        <slot
          name="page-elements"
          :on-update="(newElements: PageElement[]) => ({ ...element, advancedFilters: newElements})"
          :elements="element.advancedFilters"
          add-item-message="Ajouter un filtre (Mode avancé)"
        />
      </div>

      <!-- Count + Sort row -->
      <v-row
        v-if="element.reusesCountPosition === 'bottom'"
        class="mt-2"
        align="end"
      >
        <v-col class="py-0">
          {{ t('resultsCount', { count: reusesCount }) }}
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

      <!-- Reuses grid -->
      <v-row class="d-flex align-stretch mt-2">
        <v-col
          v-for="reuse in displayedReuses"
          :key="reuse._id"
          :md="12 / (element.columns || 2)"
          cols="12"
        >
          <reuse-card
            :reuse="reuse"
            :card-config="portalConfig.reuses.card"
            is-portal-config
          />
        </v-col>
      </v-row>

      <!-- Loading spinner -->
      <div
        v-if="loading"
        class="d-flex justify-center my-4"
      >
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
import type { Reuse } from '#api/types/reuse'
import type { PageElement, ReusesCatalogElement } from '#api/types/page'
import { mdiSortAscending, mdiSortDescending } from '@mdi/js'

type ReuseFetch = { count: number; results: Omit<Reuse, 'portals' | 'requestedPortals'>[] }

const { element, context } = defineProps<{
  element: ReusesCatalogElement
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
  sort: useStringSearchParam('sort', { default: element.defaultSort })
}

const sort = ref<string>()
const order = ref<'-1' | '1'>()

// Infinite scroll state / pagination state
const paginationPosition = computed(() => element.pagination?.position || 'none')
const currentPage = ref(1)
const displayedReuses = ref<ReuseFetch['results']>([])
const loading = ref(false)
const pageSize = 20

let reusesFetch: ReturnType<typeof useFetch<ReuseFetch | undefined>> | undefined

if (!preview) {
  const reusesQuery = computed(() => {
    const query: Record<string, string | number> = {
      select: 'slug,config,updatedAt,-_id',
      size: pageSize,
      page: currentPage.value
    }
    if (filters.search.value) query.q = filters.search.value
    if (filters.sort.value) query.sort = filters.sort.value
    return query
  })
  reusesFetch = useFetch<ReuseFetch>('/portal/api/reuses', { query: reusesQuery, watch: false })
}

// Track searches
if (!preview) {
  watch(filters.search, () => {
    if (filters.search.value) useAnalytics()?.track('search', { category: 'reuses', label: filters.search.value })
  })
}

// Computed property to check if there are more reuses to load (for infinite scroll)
const hasMore = computed(() => {
  if (preview || paginationPosition.value !== 'none') return false
  return displayedReuses.value.length < (reusesFetch?.data.value?.count || 0)
})

const reusesCount = computed(() => preview ? displayedReuses.value.length : (reusesFetch?.data.value?.count || 0))

// Total pages for pagination
const totalPages = computed(() => {
  if (preview) return 1
  return Math.ceil((reusesFetch?.data.value?.count || 0) / pageSize)
})

// Function to go to a specific page (for pagination)
const goToPage = async (page: number) => {
  if (preview || !reusesFetch) return
  loading.value = true
  try {
    currentPage.value = page
    await reusesFetch.refresh()
    if (reusesFetch.data.value?.results) {
      displayedReuses.value = [...reusesFetch.data.value.results]
    }
  } finally {
    loading.value = false
  }
}

// Function to load more reuses (for infinite scroll)
const loadMore = async () => {
  if (preview || loading.value || !hasMore.value || !reusesFetch || paginationPosition.value !== 'none') return
  loading.value = true
  try {
    currentPage.value++
    await reusesFetch?.refresh()
    if (reusesFetch?.data.value?.results) {
      displayedReuses.value.push(...reusesFetch.data.value.results)
    }
  } finally {
    loading.value = false
  }
}

// Initialize reuses on mount
if (!preview) {
  onMounted(async () => {
    await reusesFetch?.refresh()
    if (reusesFetch?.data.value?.results) {
      displayedReuses.value = [...reusesFetch.data.value.results]
    }
  })
} else {
  // Mock data for preview
  displayedReuses.value = Array.from({ length: 6 }, (_, i) => ({
    _id: `reuse-${i + 1}`,
    slug: `reuse-${i + 1}`,
    title: `Réutilisation ${i + 1}`,
    config: {
      title: `Réutilisation ${i + 1}`,
      summary: 'Exemple de réutilisation pour la prévisualisation.'
    },
    draftConfig: {
      title: `Réutilisation ${i + 1}`,
      summary: 'Exemple de réutilisation pour la prévisualisation.'
    },
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    owner: { id: 'owner-1', name: 'Organisation exemple', type: 'organization' }
  }))
}

// Reset reuses when filters change
if (!preview) {
  watch([filters.search, filters.sort], async () => {
    currentPage.value = 1
    await reusesFetch?.refresh()
    if (reusesFetch?.data.value?.results) {
      displayedReuses.value = [...reusesFetch.data.value.results]
    }
  })
}

// Update filters.sort param when sort or order change
watch([sort, order], () => {
  const [defaultField, defaultOrder] = element.defaultSort?.split(':') || ['updatedAt', '-1']
  const field = sort.value || defaultField
  const ord = order.value || defaultOrder as '-1' | '1'
  filters.sort.value = `${field}:${ord}`
})

const sortItems = [
  { title: t('sort.title'), value: 'title' },
  { title: t('sort.updatedAt'), value: 'updatedAt' }
]
</script>

<i18n lang="yaml">
  en:
    reusesCount: 'No reuse | {count} reuse | {count} reuses'
    resultsCount: 'No result | {count} result | {count} results'
    ascending: Ascending order
    descending: Descending order
    sort:
      by: Sort by
      title: Alphabetical order
      updatedAt: Update date
  fr:
    reusesCount: 'Aucune réutilisation | {count} réutilisation | {count} réutilisations'
    resultsCount: 'Aucun résultat | {count} résultat | {count} résultats'
    ascending: Ordre croissant
    descending: Ordre décroissant
    sort:
      by: Trier par
      title: Ordre alphabétique
      updatedAt: Date de mise à jour
</i18n>
