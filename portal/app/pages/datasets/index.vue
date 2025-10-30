<template>
  <!-- Page Title -->
  <h1 class="text-h4 mb-4">
    {{ t('datasetsCount', { count: datasetsFetch.data.value?.count || 0 }) }}
    <!-- TODO: Export filtered catalog -->
    <v-btn
      :icon="mdiFileTable"
      :loading="false"
      :title="t('export')"
      class="ml-2"
      density="comfortable"
      variant="text"
    />
    <v-btn
      v-if="!$vuetify.display.smAndDown"
      :icon="mdiCog"
      :title="t('catalogApiDoc')"
      to="/catalog-api-doc"
      class="ml-2"
      density="comfortable"
      variant="text"
    />
  </h1>

  <!-- Filters -->
  <!-- TODO : Navigation drawer only in desktop -->

  <v-navigation-drawer
    v-if="portalConfig.datasets.list.filtersLocation === 'left' && !$vuetify.display.smAndDown"
    style="position: absolute;"
  >
    <datasets-filters
      v-model:order="order"
      drawer
    />
  </v-navigation-drawer>
  <v-row v-else>
    <datasets-filters v-model:order="order" />
  </v-row>

  <!-- Datasets with infinite scroll -->
  <v-row class="d-flex align-stretch mt-2">
    <v-col
      v-for="dataset in displayedDatasets"
      :key="dataset.id"
      :md="12 / portalConfig.datasets.list.columns"
      cols="12"
    >
      <dataset-card
        :dataset="dataset"
        :card-config="portalConfig.datasets.card"
      />
    </v-col>
  </v-row>

  <!-- Loading spinner -->
  <div
    v-if="loading"
    class="d-flex justify-center my-4"
  >
    <v-progress-circular
      indeterminate
      color="primary"
    />
  </div>

  <!-- Intersection observer trigger for infinite scroll -->
  <div
    v-if="hasMore"
    v-intersect="(isIntersecting: boolean) => isIntersecting && loadMore()"
  />
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import { mdiCog, mdiFileTable } from '@mdi/js'

type DatasetFetch = {
  count: number
  facets: {
    concepts: { value: string; count: number }[]
    topics: { value: { id: string; title: string; color: string; icon?: { svgPath: string } }; count: number }[]
    owner: { value: { id: string; name: string; department?: string }; count: number }[]
  }
  results: {
    id: string
    slug: string
    title: string
    summary: string
    dataUpdatedAt: string
    updatedAt: string
    owner: Account
    extras: {
      applications?: { id: string; updatedAt: string }[]
    },
    bbox?: number[]
    topics: { id: string; title: string; color: string }[]
    keywords?: string[]
    image?: string
    isMetaOnly: boolean
  }[]
}

const search = useStringSearchParam('q')
const sort = useStringSearchParam('sort')
const filters = {
  concepts: useStringsArraySearchParam('concept'),
  topics: useStringsArraySearchParam('topic'),
  owners: useStringsArraySearchParam('owner')
}
const order = ref<0 | 1>(0) // 0 = desc, 1 = asc

const { t } = useI18n()

const { portal, portalConfig } = usePortalStore()

// Infinite scroll state
const currentPage = ref(0)
const displayedDatasets = ref<DatasetFetch['results']>([])
const loading = ref(false)

const datasetsQuery = computed(() => {
  const query: Record<string, string | number> = {
    select: 'id,slug,title,summary,dataUpdatedAt,updatedAt,extras,bbox,topics,keywords,image,isMetaOnly,-userPermissions',
    facets: 'concepts,topics,owner',
    publicationSites: 'data-fair-portals:' + portal.value._id,
    truncate: 250,
    size: 20,
    page: currentPage.value + 1
  }
  if (search.value) query.q = search.value

  if (sort.value) {
    query.sort = sort.value + ':' + (((order.value ?? 0) * 2 - 1))
  } else if (!search.value) {
    query.sort = portalConfig.value.datasets.list.defaultSort + ':' + ((order.value ?? 0) * 2 - 1)
  }
  // Otherwise (active search without user-defined sort) => no sort parameter, use relevance order returned by MongoDB

  if (filters.concepts.value?.length) query.concepts = filters.concepts.value.join(',')
  if (filters.topics.value?.length) query.topics = filters.topics.value.join(',')
  if (filters.owners.value?.length) query.owner = filters.owners.value.join(',')
  return query
})
const datasetsFetch = useLocalFetch<DatasetFetch>('/data-fair/api/v1/datasets', { query: datasetsQuery, watch: false })

// Computed property to check if there are more datasets to load
const hasMore = computed(() => displayedDatasets.value.length < (datasetsFetch.data.value?.count || 0))

// Function to load more datasets
const loadMore = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    currentPage.value++
    await datasetsFetch.refresh()

    if (datasetsFetch.data.value?.results) {
      displayedDatasets.value.push(...datasetsFetch.data.value.results)
    }
  } finally {
    loading.value = false
  }
}

// Initialize datasets on mount
onMounted(async () => {
  await datasetsFetch.refresh()
  if (datasetsFetch.data.value?.results) {
    displayedDatasets.value = [...datasetsFetch.data.value.results]
  }
})

// Reset datasets when filters change
watch([search, sort, order, filters.concepts, filters.topics, filters.owners], async () => {
  currentPage.value = 0
  await datasetsFetch.refresh()
  if (datasetsFetch.data.value?.results) {
    displayedDatasets.value = [...datasetsFetch.data.value.results]
  }
})

usePageSeo({
  title: t('seo.title', { title: portalConfig.value.title }),
  description: t('seo.description')
})

</script>

<i18n lang="yaml">
  en:
    ascending: Ascending order
    catalogApiDoc: Catalog API Documentation
    datasetsCount: '{count} dataset | {count} datasets'
    descending: Descending order
    export: Export filtered data as CSV
    filters:
      concepts: Concepts
      noConcepts: No concepts available
      topics: Topics
      noTopics: No topics available
    search: Search
    seo:
      title: 'Datasets - {title}'
      description: 'Browse and search open datasets available on {title}. Find data by topics, concepts, and more.'
    sort:
      by: Sort by
      createdAt: Creation date
      dataUpdatedAt: Data update date
      title: Alphabetical order

  fr:
    ascending: Ordre croissant
    catalogApiDoc: Documentation de l'API du catalogue
    datasetsCount: '{count} jeu de données | {count} jeux de données'
    descending: Ordre décroissant
    export: Exporter les données filtrées au format CSV
    filters:
      concepts: Concepts
      noConcepts: Aucun concept disponible
      topics: Thématiques
      noTopics: Aucune thématique disponible
    search: Rechercher
    seo:
      title: 'Données - {title}'
      description: 'Explorez nos jeux de données. Trouvez des données par thèmes, concepts, et plus encore.'
    sort:
      by: Trier par
      createdAt: Date de création
      dataUpdatedAt: Date de mise à jour des données
      title: Ordre alphabétique
</i18n>
