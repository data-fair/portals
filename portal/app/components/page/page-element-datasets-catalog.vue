<template>
  <v-row>
    <!-- Left Column: Filters (256px) -->
    <v-col
      v-if="element.filters?.items?.length && element.filters.position === 'left' && !$vuetify.display.smAndDown"
      style="max-width: 256px;"
      class="pa-0"
    >
      <catalog-filters
        :config="element"
        catalog-type="datasets"
        drawer
      />
    </v-col>

    <!-- Main Column: Main Content -->
    <v-col>
      <!-- Page Title -->
      <component
        :is="headingTag"
        v-if="element.datasetsCountPosition === 'top'"
        class="text-h4 mb-4"
      >
        {{ t('datasetsCount', { count: datasetsCount }) }}
        <v-btn
          v-if="element.showApiButton && !$vuetify.display.smAndDown"
          :icon="mdiCog"
          :title="t('catalogApiDoc')"
          to="/catalog-api-doc"
          class="ml-2"
          density="comfortable"
          variant="text"
        />
      </component>

      <!-- Standard Filters -->
      <v-row
        v-if="element.filters?.items?.length && (element.filters.position !== 'left' || $vuetify.display.smAndDown)"
        class="my-0"
      >
        <catalog-filters
          :config="element"
          catalog-type="datasets"
        />
      </v-row>

      <!-- Advanced Filters -->
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

      <!-- Datasets Count + API Link + Order -->
      <v-row
        v-if="element.datasetsCountPosition === 'bottom'"
        class="mt-2"
        align="end"
      >
        <v-col class="py-0">
          {{ t('resultsCount', { count: datasetsCount }) }}
          <v-btn
            v-if="element.showApiButton && !$vuetify.display.smAndDown"
            :icon="mdiCog"
            :title="t('catalogApiDoc')"
            to="/catalog-api-doc"
            density="comfortable"
            variant="text"
            class="ml-2"
          />
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

      <!-- Datasets -->
      <v-row class="d-flex align-stretch mt-2">
        <v-col
          v-for="dataset in displayedDatasets"
          :key="dataset.id"
          :md="12 / (element.columns || 2)"
          cols="12"
        >
          <dataset-card
            :dataset="dataset"
            :card-config="portalConfig.datasets.card"
          />
        </v-col>
      </v-row>

      <!-- Loading spinner -->
      <!-- TODO: Replace by skeleton-loader ? -->
      <div
        v-if="loading"
        class="d-flex justify-center my-4"
      >
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>

      <!-- Pagination above footer -->
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
import type { Dataset } from '#api/types/index.ts'
import type { PageElement, DatasetsCatalogElement } from '#api/types/page'
import { mdiCog, mdiSortAscending, mdiSortDescending } from '@mdi/js'

type DatasetFetch = { count: number; results: Omit<Dataset, 'userPermissions'>[] }

const { element, context } = defineProps<{
  element: DatasetsCatalogElement
  context?: { isRoot: boolean, index: number, parentLength: number }
}>()
const { portal, portalConfig, preview } = usePortalStore()
const { t } = useI18n()

const headingTag = computed(() => {
  let level = 1
  if (portalConfig.value.header?.show && portalConfig.value.header?.showTitle) level++
  if (context?.isRoot && context.index > 0) level++
  return `h${level}`
})

const filters = {
  search: useStringSearchParam('q'),
  concepts: useStringsArraySearchParam('concepts'),
  topics: useStringsArraySearchParam('topics'),
  keywords: useStringsArraySearchParam('keywords'),
  owners: useStringsArraySearchParam('owner'),
  sort: useStringSearchParam('sort', { default: element.defaultSort })
}

const sort = ref<string>()
const order = ref<'-1' | '1'>()

// Infinite scroll state / pagination state
const paginationPosition = computed(() => element.pagination?.position || 'none')
const currentPage = ref(1)
const displayedDatasets = ref<DatasetFetch['results']>([])
const loading = ref(false)
const pageSize = 20

let datasetsFetch: ReturnType<typeof useLocalFetch<DatasetFetch>> | undefined

if (!preview) {
  const datasetsQuery = computed(() => {
    const query: Record<string, string | number> = {
      select: 'id,slug,title,summary,dataUpdatedAt,updatedAt,extras,bbox,topics,keywords,image,isMetaOnly,-userPermissions',
      publicationSites: 'data-fair-portals:' + portal.value._id,
      truncate: 250,
      size: pageSize,
      page: currentPage.value
    }
    if (filters.search.value) query.q = filters.search.value
    if (filters.concepts.value?.length) query.concepts = filters.concepts.value.join(',')
    if (filters.topics.value?.length) query.topics = filters.topics.value.join(',')
    if (filters.keywords.value?.length) query.keywords = filters.keywords.value.join(',')
    if (filters.owners.value?.length) query.owner = filters.owners.value.join(',')
    if (filters.sort.value) query.sort = filters.sort.value
    return query
  })
  datasetsFetch = useLocalFetch<DatasetFetch>('/data-fair/api/v1/datasets', { query: datasetsQuery, watch: false })
}

// Track searches
if (!preview) {
  // TODO: ask if params are tracked, in this case, this track is useless
  watch(filters.search, () => {
    if (filters.search.value) useAnalytics()?.track('search', { category: 'datasets', label: filters.search.value })
  })
}

// Computed property to check if there are more datasets to load (for infinite scroll)
const hasMore = computed(() => {
  if (preview || paginationPosition.value !== 'none') return false
  return displayedDatasets.value.length < (datasetsFetch?.data.value?.count || 0)
})

const datasetsCount = computed(() => preview ? displayedDatasets.value.length : (datasetsFetch?.data.value?.count || 0))

// Total pages for pagination
const totalPages = computed(() => {
  if (preview) return 1
  return Math.ceil((datasetsFetch?.data.value?.count || 0) / pageSize)
})

// Function to go to a specific page (for pagination)
const goToPage = async (page: number) => {
  if (preview || !datasetsFetch) return
  loading.value = true
  try {
    currentPage.value = page
    await datasetsFetch.refresh()
    if (datasetsFetch.data.value?.results) {
      displayedDatasets.value = [...datasetsFetch.data.value.results]
    }
    // goTo(catalogTop.value)
  } finally {
    loading.value = false
  }
}

// Function to load more datasets (for infinite scroll)
const loadMore = async () => {
  if (preview || loading.value || !hasMore.value || !datasetsFetch || paginationPosition.value !== 'none') return
  loading.value = true
  try {
    currentPage.value++
    await datasetsFetch?.refresh()
    if (datasetsFetch?.data.value?.results) {
      displayedDatasets.value.push(...datasetsFetch.data.value.results)
    }
  } finally {
    loading.value = false
  }
}

// Initialize datasets on mount
if (!preview) {
  onMounted(async () => {
    await datasetsFetch?.refresh()
    if (datasetsFetch?.data.value?.results) {
      displayedDatasets.value = [...datasetsFetch.data.value.results]
    }
  })
} else {
// Mock data for preview
  displayedDatasets.value = Array.from({ length: 6 }, (_, i) => ({
    id: `dataset-${i + 1}`,
    slug: `dataset-${i + 1}`,
    title: `Dataset ${i + 1}`,
    summary: 'Exemple de jeu de données pour la prévisualisation.',
    dataUpdatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: { id: 'owner-1', name: 'Organisation exemple', type: 'organization' },
    extras: {},
    topics: [{ id: 'topic-1', title: 'Thématique exemple', color: '#45d31d' }],
    isMetaOnly: false,
  }))
}

// Reset datasets when filters change
if (!preview) {
  watch([filters.search, filters.sort, filters.concepts, filters.topics, filters.keywords, filters.owners], async () => {
    currentPage.value = 1
    await datasetsFetch?.refresh()
    if (datasetsFetch?.data.value?.results) {
      displayedDatasets.value = [...datasetsFetch.data.value.results]
    }
    // goTo(catalogTop.value)
  })
}

// Update filters.sort param when sort or order change
watch([sort, order], () => {
  const [defaultField, defaultOrder] = element.defaultSort?.split(':') || ['createdAt', '-1']
  const field = sort.value || defaultField
  const ord = order.value || defaultOrder as '-1' | '1'
  filters.sort.value = `${field}:${ord}`
})

const sortItems = [
  { title: t('sort.createdAt'), value: 'createdAt' },
  { title: t('sort.dataUpdatedAt'), value: 'dataUpdatedAt' },
  { title: t('sort.title'), value: 'title' },
  { title: portalConfig.value?.labelsOverrides?.owner || t('sort.owner'), value: 'owner.departmentName' }
]

</script>

<i18n lang="yaml">
  en:
    ascending: Ascending order
    catalogApiDoc: Catalog API Documentation
    datasetsCount: 'No dataset | {count} dataset | {count} datasets'
    resultsCount: 'No result | {count} result | {count} results'
    descending: Descending order
    export: Export filtered data as CSV
    search: Search
    sort:
      by: Sort by
      createdAt: Creation date
      dataUpdatedAt: Data update date
      title: Alphabetical order
      owner: Owner

  fr:
    ascending: Ordre croissant
    catalogApiDoc: Documentation de l'API du catalogue
    datasetsCount: 'Aucun jeu de données | {count} jeu de données | {count} jeux de données'
    resultsCount: 'Aucun résultat | {count} résultat | {count} résultats'
    descending: Ordre décroissant
    export: Exporter les données filtrées au format CSV
    search: Rechercher
    sort:
      by: Trier par
      createdAt: Date de création
      dataUpdatedAt: Date de mise à jour des données
      title: Ordre alphabétique
      owner: Propriétaire
</i18n>
