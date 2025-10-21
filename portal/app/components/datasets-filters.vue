<template>
  <!-- Search -->
  <v-col
    cols="12"
    :md="drawer ? 12 : 4"
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
    :md="drawer ? 12 : 4"
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

  <!-- Topics filters (mobile view or drawer)-->
  <v-col
    v-if="$vuetify.display.smAndDown || drawer"
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

  <!-- Sort/Order -->
  <v-col
    cols="12"
    :md="drawer ? 12 : 4"
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
        <!-- Order toggle -->
        <v-btn-toggle
          v-if="!drawer"
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

  <v-col
    v-if="drawer"
    cols="12"
  >
    <!-- Order toggle -->
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
  </v-col>

  <!-- Topics filter (desktop view)-->
  <v-col
    v-if="!$vuetify.display.smAndDown"
    cols="12"
  >
    <topics-list
      v-model="filters.topics.value"
      :topics="topicsItems"
      :config="portalConfig.datasets.list.topicsFilters"
      filters
    />
  </v-col>
</template>

<script setup lang="ts">
import { mdiMagnify, mdiSortAscending, mdiSortDescending } from '@mdi/js'

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

defineProps<{
  drawer?: boolean
}>()

const search = useStringSearchParam('q')
const sort = useStringSearchParam('sort')
const filters = {
  concepts: useStringsArraySearchParam('concept'),
  topics: useStringsArraySearchParam('topic'),
  owners: useStringsArraySearchParam('owner')
}
const order = defineModel<number>('order', { default: 0 }) // 0 = desc, 1 = asc

type Facets = {
  concepts: { value: string; count: number }[]
  topics: { value: { id: string; title: string; color: string; icon?: { svgPath: string } }; count: number }[]
  owner: { value: { id: string; name: string; department?: string }; count: number }[]
}

const datasetsFetch = useLocalFetch<{ facets: Facets }>('/data-fair/api/v1/datasets', {
  query: {
    facets: 'concepts,topics,owner',
    size: 0,
    publicationSites: 'data-fair-portals:' + portal.value._id,
  }
})
const conceptsFetch = useLocalFetch<Concept[]>('/data-fair/api/v1/vocabulary')
const facets = computed(() => datasetsFetch.data.value?.facets ?? { concepts: [], topics: [], owner: [] })

const conceptsItems = computed(() => {
  const conceptsList = conceptsFetch.data.value ?? []
  const selected = filters.concepts.value ?? []
  const titleMap = new Map(conceptsList.map(c => [c.identifiers[0], c.title]))

  // Build items from facets
  const items = facets.value.concepts.map(facet => {
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
  return facets.value.topics.map(facet => ({ ...facet.value, count: facet.count }))
})

const sortItems = [
  { title: t('sort.createdAt'), value: 'createdAt' },
  { title: t('sort.dataUpdatedAt'), value: 'dataUpdatedAt' },
  { title: t('sort.title'), value: 'title' }
]

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
