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
      :density="config.filters?.density || 'comfortable'"
      :rounded="config.filters?.rounded"
      variant="outlined"
      autofocus
      clearable
      hide-details
      @keyup.enter="filters.search.value = search"
      @click:append-inner="filters.search.value = search"
      @click:clear="filters.search.value = ''"
    />
  </v-col>

  <!-- Concepts filter (datasets only) -->
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
      :density="config.filters?.density || 'comfortable'"
      :rounded="config.filters?.rounded"
      variant="outlined"
      chips
      clearable
      closable-chips
      multiple
      hide-details
    />
  </v-col>

  <!-- Base Application filter (applications only) -->
  <v-col
    v-if="showFilter('base-application')"
    cols="12"
    :md="colSize"
  >
    <v-autocomplete
      v-model="filters.baseApplication.value"
      :items="baseApplicationItems"
      :label="t('filters.baseApplication')"
      :no-data-text="t('filters.noBaseApplication')"
      :density="config.filters?.density || 'comfortable'"
      :rounded="config.filters?.rounded"
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
      :density="config.filters?.density || 'comfortable'"
      :rounded="config.filters?.rounded"
      variant="outlined"
      chips
      clearable
      closable-chips
      multiple
      hide-details
    />
  </v-col>

  <!-- Keywords filters (datasets only) -->
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
      item-value="value"
      :density="config.filters?.density || 'comfortable'"
      :rounded="config.filters?.rounded"
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
      :label="portalConfig.labelsOverrides?.owner || t('filters.owners')"
      :no-data-text="t(`filters.${portalConfig.labelsOverrides?.owner ? 'noChoices' : 'noOwners'}`)"
      :items="ownersItems"
      :density="config.filters?.density || 'comfortable'"
      :rounded="config.filters?.rounded"
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
      :density="config.filters?.density || 'comfortable'"
      :rounded="config.filters?.rounded"
      variant="outlined"
      hide-details
      clearable
    >
      <template v-if="!drawer" #append>
        <!-- Order toggle -->
        <v-btn-toggle
          v-model="order"
          :density="config.filters?.density || 'comfortable'"
          :rounded="config.filters?.rounded"
          variant="outlined"
          class="h-100"
          divided
          mandatory
        >
          <v-btn
            :icon="mdiSortDescending"
            :title="t('descending')"
            stacked
          />
          <v-btn
            :icon="mdiSortAscending"
            :title="t('ascending')"
            stacked
          />
        </v-btn-toggle>
      </template>
    </v-select>
  </v-col>

  <!-- Order toggle (drawer) -->
  <v-col
    v-if="drawer && showFilter('sort')"
    cols="12"
  >
    <v-btn-toggle
      v-model="order"
      :density="config.filters?.density || 'comfortable'"
      :rounded="config.filters?.rounded"
      variant="outlined"
      class="w-100"
      divided
      mandatory
    >
      <v-btn
        :icon="mdiSortDescending"
        :title="t('descending')"
        class="flex-grow-1"
      />
      <v-btn
        :icon="mdiSortAscending"
        :title="t('ascending')"
        class="flex-grow-1"
      />
    </v-btn-toggle>
  </v-col>
</template>

<script setup lang="ts">
import type { DatasetsCatalogElement, ApplicationsCatalogElement } from '#api/types/page'
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

type BaseApplication = {
  id: string
  title: string
}

type CatalogType = 'datasets' | 'applications'
type FilterType = 'search' | 'concepts' | 'base-application' | 'topics' | 'keywords' | 'owners' | 'sort'

const { t } = useI18n()
const { portal, preview, portalConfig } = usePortalStore()

const { config, catalogType, drawer } = defineProps<{
  config: DatasetsCatalogElement | ApplicationsCatalogElement
  catalogType: CatalogType
  drawer?: boolean
}>()

const filters = {
  search: useStringSearchParam('q'),
  concepts: useStringsArraySearchParam('concepts'),
  baseApplication: useStringsArraySearchParam('base-application'),
  topics: useStringsArraySearchParam('topics'),
  keywords: useStringsArraySearchParam('keywords'),
  owners: useStringsArraySearchParam('owner'),
  sort: useStringSearchParam('sort', { default: config.defaultSort })
}

const search = ref<string>(filters.search.value || '')
const sort = ref<string>()
const order = ref<'-1' | '1'>()

const showFilter = (filter: FilterType) => ((config.filters?.items ?? []) as FilterType[]).includes(filter)

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
  'base-application': { value: BaseApplication; count: number }[]
  topics: { value: { id: string; title: string; color: string; icon?: { svgPath: string } }; count: number }[]
  keywords: { value: string; count: number }[]
  owner: { value: Account; count: number }[]
}

let catalogFetch: ReturnType<typeof useLocalFetch<{ facets: Facets }>> | undefined
let conceptsFetch: ReturnType<typeof useLocalFetch<Concept[]>> | undefined
if (!preview) {
  const facetsToFetch = []
  if (showFilter('concepts')) facetsToFetch.push('concepts')
  if (showFilter('base-application')) facetsToFetch.push('base-application')
  if (showFilter('topics')) facetsToFetch.push('topics')
  if (showFilter('keywords')) facetsToFetch.push('keywords')
  if (showFilter('owners')) facetsToFetch.push('owner')

  const endpoint = catalogType === 'datasets' ? '/data-fair/api/v1/datasets' : '/data-fair/api/v1/applications'
  catalogFetch = useLocalFetch<{ facets: Facets }>(endpoint, {
    query: {
      facets: facetsToFetch.join(','),
      size: 0,
      publicationSites: 'data-fair-portals:' + portal.value._id,
    }
  })

  if (showFilter('concepts')) {
    conceptsFetch = useLocalFetch<Concept[]>('/data-fair/api/v1/vocabulary')
  }
}

const previewFacets: Facets = {
  concepts: [
    { value: 'concept-a', count: 4 },
    { value: 'concept-b', count: 2 }
  ],
  'base-application': [
    { value: { id: 'app-1', title: 'Application 1' }, count: 3 },
    { value: { id: 'app-2', title: 'Application 2' }, count: 5 }
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
const facets = computed(() => preview ? previewFacets : (catalogFetch?.data.value?.facets ?? { concepts: [], 'base-application': [], topics: [], keywords: [], owner: [] }))

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

const baseApplicationItems = computed(() => {
  return facets.value['base-application'].map(facet => {
    const app = facet.value
    return {
      title: `${app.title} (${facet.count})`,
      value: app.id
    }
  })
})

const ownersItems = computed(() => {
  return facets.value.owner.map(facet => {
    const owner = facet.value
    let title = owner.department ? (owner.departmentName || owner.department) : owner.name
    title += ` (${facet.count})`
    const value = `${owner.type}:${owner.id}:` + (owner.department ? `${owner.department}` : '-')
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

// Sort items depend on catalog type
const sortItems = computed(() => {
  if (catalogType === 'datasets') {
    return [
      { title: t('sort.createdAt'), value: 'createdAt' },
      { title: t('sort.dataUpdatedAt'), value: 'dataUpdatedAt' },
      { title: t('sort.title'), value: 'title' },
      { title: portalConfig.value?.labelsOverrides?.owner || t('sort.owner'), value: 'owner.departmentName' }
    ]
  } else {
    return [
      { title: t('sort.createdAt'), value: 'createdAt' },
      { title: t('sort.updatedAt'), value: 'updatedAt' },
      { title: t('sort.title'), value: 'title' },
      { title: portalConfig.value?.labelsOverrides?.owner || t('sort.owner'), value: 'owner.departmentName' }
    ]
  }
})

</script>

<i18n lang="yaml">
  en:
    ascending: Ascending order
    descending: Descending order
    export: Export filtered data as CSV
    filters:
      concepts: Concepts
      baseApplication: Base Applications
      topics: Topics
      keywords: Keywords
      owners: Owners
      noConcepts: No concepts available
      noBaseApplication: No base applications available
      noTopics: No topics available
      noKeywords: No keywords available
      noOwners: No owners available
      noChoices: No choices available # When a label is overridden
    search: Search
    sort:
      by: Sort by
      createdAt: Creation date
      dataUpdatedAt: Data update date
      updatedAt: Update date
      title: Alphabetical order
      owner: Owner

  fr:
    ascending: Ordre croissant
    descending: Ordre décroissant
    export: Exporter les données filtrées au format CSV
    filters:
      concepts: Concepts
      baseApplication: Applications de base
      topics: Thématiques
      keywords: Mots-clés
      owners: Propriétaires
      noConcepts: Aucun concept disponible
      noBaseApplication: Aucune application de base disponible
      noTopics: Aucune thématique disponible
      noKeywords: Aucun mot-clé disponible
      noOwners: Aucun propriétaire disponible
      noChoices: Aucun choix disponible # When a label is overridden
    search: Rechercher
    sort:
      by: Trier par
      createdAt: Date de création
      dataUpdatedAt: Date de mise à jour des données
      updatedAt: Date de mise à jour
      title: Ordre alphabétique
      owner: Propriétaire
</i18n>
