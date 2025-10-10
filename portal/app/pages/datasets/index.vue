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
  <v-row>
    <!-- Search -->
    <v-col
      cols="12"
      md="4"
    >
      <v-text-field
        v-model="search"
        :append-inner-icon="mdiMagnify"
        :label="t('search')"
        density="comfortable"
        variant="outlined"
        autofocus
        clearable
        hide-details
      />
    </v-col>

    <!-- Concepts filter -->
    <v-col
      cols="12"
      md="4"
    >
      <v-autocomplete
        v-model="filters.concepts.value"
        :items="conceptsItems"
        :label="t('filters.concepts')"
        :no-data-text="t('filters.noConcepts')"
        density="comfortable"
        variant="outlined"
        chips
        clearable
        closable-chips
        multiple
        hide-details
      />
    </v-col>

    <!-- Topics filters (mobile view)-->
    <v-col
      v-if="$vuetify.display.smAndDown"
      cols="12"
    >
      <v-autocomplete
        v-model="filters.topics.value"
        :label="t('filters.topics')"
        :no-data-text="t('filters.noTopics')"
        :items="topicsItems"
        :item-title="(item) => `${item.title} (${item.count})`"
        item-value="id"
        density="comfortable"
        variant="outlined"
        chips
        clearable
        closable-chips
        multiple
        hide-details
      />
    </v-col>

    <!-- TODO: Add owner filter -->

    <!-- Sort -->
    <v-col
      cols="12"
      md="4"
    >
      <v-select
        v-model="sort"
        :items="sortItems"
        :label="t('sort.by')"
        density="comfortable"
        variant="outlined"
        hide-details
        clearable
      >
        <template #append>
          <v-btn-toggle
            v-model="order"
            variant="outlined"
            mandatory
          >
            <v-btn
              :icon="mdiSortDescending"
              :title="t('descending')"
            />
            <v-btn
              :icon="mdiSortAscending"
              :title="t('ascending')"
            />
          </v-btn-toggle>
        </template>
      </v-select>
    </v-col>

    <!-- Topics filter (desktop view)-->
    <v-col
      v-if="!$vuetify.display.smAndDown"
      cols="12"
    >
      <topics-filter
        v-model="filters.topics.value"
        :topics="topicsItems"
      />
    </v-col>
  </v-row>

  <!-- TODO: Add infinite scroll -->
  <v-row class="d-flex align-stretch mt-2">
    <v-col
      v-for="(dataset, i) in datasetsFetch.data.value?.results"
      :key="i"
      :md="12 / portalConfig.datasets.columns"
      cols="12"
    >
      <dataset-card
        :dataset="dataset"
        :card-config="portalConfig.datasets"
      />
    </v-col>
  </v-row>

  <!-- TODO: Show loading spinner -->
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import { mdiCog, mdiFileTable, mdiMagnify, mdiSortAscending, mdiSortDescending } from '@mdi/js'

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
    topics: { id: string; title: string }[]
    image?: string
    isMetaOnly: boolean
  }[]
}

type Concept = {
  id: string
  title: string
  description?: string
  identifiers: string[]
  type: string
  tag: string
  private: boolean
}

const { t } = useI18n()
const { portal, portalConfig } = usePortalStore()
const search = useStringSearchParam('q')
const sort = useStringSearchParam('sort')
const filters = {
  concepts: useStringsArraySearchParam('concept'),
  topics: useStringsArraySearchParam('topic'),
  owners: useStringsArraySearchParam('owner')
}
const order = ref(0) // 0 = desc, 1 = asc

const datasetsQuery = computed(() => {
  const query: Record<string, string> = {
    select: 'id,slug,title,summary,dataUpdatedAt,updatedAt,extras,bbox,topics,image,isMetaOnly,-userPermissions',
    facets: 'concepts,topics,owner',
    publicationSites: 'data-fair-portals:' + portal.value._id,
    truncate: '250'
  }
  if (search.value) query.q = search.value

  if (sort.value) {
    query.sort = sort.value + ':' + (order.value * 2 - 1)
  } else if (!search.value) {
    query.sort = portalConfig.value.datasets.defaultSort + ':' + (order.value * 2 - 1)
  }
  // Otherwise (active search without user-defined sort) => no sort parameter, use relevance order returned by MongoDB

  if (filters.concepts.value?.length) query.concepts = filters.concepts.value.join(',')
  if (filters.topics.value?.length) query.topics = filters.topics.value.join(',')
  if (filters.owners.value?.length) query.owner = filters.owners.value.join(',')
  return query
})
const datasetsFetch = useLocalFetch<DatasetFetch>('/data-fair/api/v1/datasets', { query: datasetsQuery })
const conceptsFetch = useLocalFetch<Concept[]>('/data-fair/api/v1/vocabulary')

const conceptsItems = computed(() => {
  const facets = datasetsFetch.data.value?.facets?.concepts ?? []
  const conceptsList = conceptsFetch.data.value ?? []
  const selected = filters.concepts.value ?? []
  const titleMap = new Map(conceptsList.map(c => [c.identifiers[0], c.title]))

  // Build items from facets
  const items = facets.map(facet => {
    const title = titleMap.get(facet.value) ?? facet.value
    return { title: `${title} (${facet.count})`, value: facet.value }
  })

  // Add selected concepts for filters that are not in facets (count = 0)
  selected.forEach(identifier => {
    if (!items.some(item => item.value === identifier)) {
      const title = titleMap.get(identifier) ?? identifier
      items.push({ title: `${title} (0)`, value: identifier })
    }
  })

  return items
})

const topicsItems = computed(() => {
  const facets = datasetsFetch.data.value?.facets?.topics ?? []
  return facets.map(facet => ({ ...facet.value, count: facet.count }))
})

const sortItems = [
  { title: t('sort.createdAt'), value: 'createdAt' },
  { title: t('sort.dataUpdatedAt'), value: 'dataUpdatedAt' },
  { title: t('sort.title'), value: 'title' }
]

useSeoMeta({
  title: t('seo.title', { title: portalConfig.value.title }),
  description: t('seo.description'),
  ogTitle: t('seo.title', { title: portalConfig.value.title }),
  ogDescription: t('seo.description'),
  ogType: 'website'
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
