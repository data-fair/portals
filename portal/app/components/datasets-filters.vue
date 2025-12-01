<template>
  <!-- Search -->
  <v-col
    v-if="showFilter('search')"
    cols="12"
    :md="colSize"
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
      @keyup.enter="filters.search.value = search"
      @click:append-inner="filters.search.value = search"
    />
  </v-col>

  <!-- Concepts filter -->
  <v-col
    v-if="showFilter('concepts')"
    cols="12"
    :md="colSize"
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

  <!-- Topics filters -->
  <v-col
    v-if="showFilter('topics')"
    cols="12"
    :md="colSize"
  >
    <v-autocomplete
      v-model="filters.topics.value"
      :label="t('filters.topics')"
      :no-data-text="t('filters.noTopics')"
      :items="facets.topics"
      :item-title="(item) => `${item.value.title} (${item.count})`"
      :item-value="(item) => item.value.id"
      density="comfortable"
      variant="outlined"
      chips
      clearable
      closable-chips
      multiple
      hide-details
    />
  </v-col>

  <!-- Keywords filters -->
  <v-col
    v-if="showFilter('keywords')"
    cols="12"
    :md="colSize"
  >
    <v-autocomplete
      v-model="filters.keywords.value"
      :label="t('filters.keywords')"
      :no-data-text="t('filters.noKeywords')"
      :items="facets.keywords"
      :item-title="(item) => `${item.value} (${item.count})`"
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

  <!-- Owners filters -->
  <v-col
    v-if="showFilter('owners')"
    cols="12"
    :md="colSize"
  >
    <v-autocomplete
      v-model="filters.owners.value"
      :label="t('filters.owners')"
      :no-data-text="t('filters.noOwners')"
      :items="ownersItems"
      density="comfortable"
      variant="outlined"
      chips
      clearable
      closable-chips
      multiple
      hide-details
    >
      <template #chip="{ props, item }">
        <v-chip
          v-bind="props"
          :prepend-avatar="item.raw.avatar"
        />
      </template>

      <template #item="{ props, item }">
        <v-list-item
          v-bind="props"
          :prepend-avatar="item.raw.avatar"
        />
      </template>
    </v-autocomplete>
  </v-col>

  <!-- Sort/Order -->
  <v-col
    v-if="showFilter('sort')"
    cols="12"
    :md="colSize"
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
    v-if="drawer && showFilter('sort')"
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
</template>

<script setup lang="ts">
import type { DatasetsCatalogElement } from '#api/types/page'
import type { Account } from '@data-fair/lib-vue/session'
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
const { portal, preview } = usePortalStore()

const { config, drawer } = defineProps<{
  config: DatasetsCatalogElement
  drawer?: boolean
}>()

const filters = {
  search: useStringSearchParam('q'),
  concepts: useStringsArraySearchParam('concepts'),
  topics: useStringsArraySearchParam('topics'),
  keywords: useStringsArraySearchParam('keywords'),
  owners: useStringsArraySearchParam('owner'),
  sort: useStringSearchParam('sort', { default: config.defaultSort })
}

const search = ref<string>('')
const sort = ref<string>()
const order = ref<'-1' | '1'>()

const showFilter = (filter: NonNullable<NonNullable<DatasetsCatalogElement['filters']>['items']>[number]) => !!config.filters?.items?.includes(filter)

// Compute best column size based on number of filters shown
const colSize = computed(() => {
  if (drawer) return 12

  const count = config.filters?.items?.length || 0
  if (count === 2) return 6
  if (count === 3) return 4
  if (count === 4) return 6
  if (count === 5) return 4
  if (count === 6) return 4
  return 6
})

type Facets = {
  concepts: { value: string; count: number }[]
  topics: { value: { id: string; title: string; color: string; icon?: { svgPath: string } }; count: number }[]
  keywords: { value: string; count: number }[]
  owner: { value: Account; count: number }[]
}

let datasetsFetch: ReturnType<typeof useLocalFetch<{ facets: Facets }>> | undefined
let conceptsFetch: ReturnType<typeof useLocalFetch<Concept[]>> | undefined
if (!preview) {
  datasetsFetch = useLocalFetch<{ facets: Facets }>('/data-fair/api/v1/datasets', {
    query: {
      facets: 'concepts,topics,owner,keywords', // TODO fetch only needed facets
      size: 0,
      publicationSites: 'data-fair-portals:' + portal.value._id,
    }
  })
  conceptsFetch = useLocalFetch<Concept[]>('/data-fair/api/v1/vocabulary')
}

const previewFacets: Facets = {
  concepts: [
    { value: 'concept-a', count: 4 },
    { value: 'concept-b', count: 2 }
  ],
  topics: [
    { value: { id: 'topic-1', title: 'Thématique exemple', color: '#45d31d' }, count: 5 },
    { value: { id: 'topic-2', title: 'Autre thématique', color: '#1d6bd3' }, count: 3 }
  ],
  keywords: [
    { value: 'keyword-1', count: 6 },
    { value: 'keyword-2', count: 2 }
  ],
  owner: [
    { value: { type: 'organization', id: 'KWqAGZ4mG', name: 'Fivechat' }, count: 4 },
    { value: { type: 'organization', id: 'KWqAGZ4mG', name: 'Fivechat', department: 'dep1', departmentName: 'Department 1' }, count: 2 }
  ]
}
const facets = computed(() => preview ? previewFacets : (datasetsFetch?.data.value?.facets ?? { concepts: [], topics: [], keywords: [], owner: [] }))

const conceptsItems = computed(() => {
  const conceptsList = preview
    ? [
        { id: 'concept-a', title: 'Concept A', identifiers: ['concept-a'], type: 'tag', tag: 'concept-a', private: false },
        { id: 'concept-b', title: 'Concept B', identifiers: ['concept-b'], type: 'tag', tag: 'concept-b', private: false }
      ] as Concept[]
    : (conceptsFetch?.data.value ?? [])
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

const ownersItems = computed(() => {
  return facets.value.owner.map(facet => {
    const owner = facet.value
    let title = owner.department ? (owner.departmentName || owner.department) : owner.name
    title += ` (${facet.count})`

    let value = `${owner.type}:${owner.id}`
    if (owner.department) value += `:${owner.department}`

    const avatar = owner.department
      ? `/simple-directory/api/avatars/${owner.type}/${owner.id}/${owner.department}/avatar.png`
      : `/simple-directory/api/avatars/${owner.type}/${owner.id}/avatar.png`

    return { title, value, avatar }
  })
})

// Update filters.sort param when sort or order change
watch([sort, order], () => {
  const [defaultField, defaultOrder] = config.defaultSort?.split(':') || ['createdAt', '-1']
  const field = sort.value || defaultField
  const ord = order.value || defaultOrder as '-1' | '1'
  filters.sort.value = `${field}:${ord}`
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
    descending: Descending order
    export: Export filtered data as CSV
    filters:
      concepts: Concepts
      topics: Topics
      keywords: Keywords
      owners: Owners
      noConcepts: No concepts available
      noTopics: No topics available
      noKeywords: No keywords available
      noOwners: No owners available
    search: Search
    sort:
      by: Sort by
      createdAt: Creation date
      dataUpdatedAt: Data update date
      title: Alphabetical order

  fr:
    ascending: Ordre croissant
    descending: Ordre décroissant
    export: Exporter les données filtrées au format CSV
    filters:
      concepts: Concepts
      topics: Thématiques
      keywords: Mots-clés
      owners: Propriétaires
      noConcepts: Aucun concept disponible
      noTopics: Aucune thématique disponible
      noKeywords: Aucun mot-clé disponible
      noOwners: Aucun propriétaire disponible
    search: Rechercher
    sort:
      by: Trier par
      createdAt: Date de création
      dataUpdatedAt: Date de mise à jour des données
      title: Ordre alphabétique
</i18n>
