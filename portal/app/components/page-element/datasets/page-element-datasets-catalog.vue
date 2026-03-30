<template>
  <catalog-layout
    catalog-type="datasets"
    :element="element"
    :context="context"
    :count-label="t('datasetsCount', { count: itemsCount })"
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
    <template #count-extra>
      <v-btn
        v-if="element.showApiButton && !$vuetify.display.smAndDown"
        :icon="mdiCog"
        :title="t('catalogApiDoc')"
        to="/catalog-api-doc"
        density="comfortable"
        variant="text"
        class="ml-2"
      />
    </template>
    <template #item-card="{ item }">
      <dataset-card
        :dataset="item"
        :card-config="portalConfig.datasets.card"
        is-portal-config
      />
    </template>
    <template #page-elements="slotProps">
      <slot name="page-elements" v-bind="slotProps" />
    </template>
  </catalog-layout>
</template>

<script setup lang="ts">
import type { Dataset } from '#api/types/index.ts'
import type { DatasetsCatalogElement } from '#api/types/page'
import { mdiCog } from '@mdi/js'

type DatasetResult = Omit<Dataset, 'userPermissions'>

type DatasetFilters = {
  search: ReturnType<typeof useStringSearchParam>
  concepts: ReturnType<typeof useStringsArraySearchParam>
  topics: ReturnType<typeof useStringsArraySearchParam>
  keywords: ReturnType<typeof useStringsArraySearchParam>
  owners: ReturnType<typeof useStringsArraySearchParam>
}

const { element, context } = defineProps<{
  element: DatasetsCatalogElement
  context?: { isRoot: boolean, index: number, parentLength: number }
}>()
const { portalConfig } = usePortalStore()
const { t } = useI18n()

const {
  displayedItems, itemsCount, loading, currentPage, totalPages,
  sort, order, goToPage, loadMore
} = useCatalog<DatasetResult, DatasetFilters>(element, {
  endpoint: '/data-fair/api/v1/catalog/datasets',
  useLocalFetch: true,
  defaultSortFallback: 'createdAt:-1',
  analyticsCategory: 'datasets',
  filterDefs: () => ({
    search: useStringSearchParam('q'),
    concepts: useStringsArraySearchParam('concepts'),
    topics: useStringsArraySearchParam('topics'),
    keywords: useStringsArraySearchParam('keywords'),
    owners: useStringsArraySearchParam('owner')
  }),
  buildQuery: (filters, sortValue, page, pageSize) => {
    const query: Record<string, string | number> = {
      select: 'id,slug,title,summary,dataUpdatedAt,updatedAt,extras,bbox,topics,keywords,image,isMetaOnly,-userPermissions',
      truncate: 250,
      size: pageSize,
      page
    }
    if (filters.search.value) query.q = filters.search.value
    if (filters.concepts.value?.length) query.concepts = filters.concepts.value.join(',')
    if (filters.topics.value?.length) query.topics = filters.topics.value.join(',')
    if (filters.keywords.value?.length) query.keywords = filters.keywords.value.join(',')
    if (filters.owners.value?.length) query.owner = filters.owners.value.join(',')
    if (sortValue && !(filters.search.value && sortValue === element.defaultSort)) query.sort = sortValue
    return query
  },
  mockDataFactory: () => {
    const session = useSessionAuthenticated()
    return Array.from({ length: 6 }, (_, i) => ({
      id: `dataset-${i + 1}`,
      slug: `dataset-${i + 1}`,
      title: `Dataset ${i + 1}`,
      summary: 'Exemple de jeu de données pour la prévisualisation.',
      dataUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: session.account.value,
      extras: {},
      topics: [{ id: 'topic-1', title: 'Thématique exemple', color: '#45d31d' }],
      isMetaOnly: false,
    }))
  }
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
    catalogApiDoc: Catalog API Documentation
    datasetsCount: 'No dataset | {count} dataset | {count} datasets'
    sort:
      createdAt: Creation date
      dataUpdatedAt: Data update date
      title: Alphabetical order
      owner: Owner

  fr:
    catalogApiDoc: Documentation de l'API du catalogue
    datasetsCount: 'Aucun jeu de données | {count} jeu de données | {count} jeux de données'
    sort:
      createdAt: Date de création
      dataUpdatedAt: Date de mise à jour des données
      title: Ordre alphabétique
      owner: Propriétaire
</i18n>
