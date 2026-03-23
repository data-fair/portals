<template>
  <catalog-layout
    catalog-type="reuses"
    :element="element"
    :context="context"
    :count-label="t('reusesCount', { count: itemsCount })"
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
      <reuse-card
        :reuse="item"
        :card-config="portalConfig.reuses.card"
        is-portal-config
      />
    </template>
    <template #page-elements="slotProps">
      <slot name="page-elements" v-bind="slotProps" />
    </template>
  </catalog-layout>
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse'
import type { ReusesCatalogElement } from '#api/types/page'

type ReuseResult = Pick<Reuse, '_id' | 'slug' | 'config' | 'updatedAt'>

const { element, context } = defineProps<{
  element: ReusesCatalogElement
  context?: { isRoot: boolean, index: number, parentLength: number }
}>()
const { portalConfig } = usePortalStore()
const { t } = useI18n()

const {
  displayedItems, itemsCount, loading, currentPage, totalPages,
  sort, order, goToPage, loadMore
} = useCatalog<ReuseResult, { search: ReturnType<typeof useStringSearchParam> }>(element, {
  endpoint: '/portal/api/reuses',
  defaultSortFallback: 'updatedAt:-1',
  analyticsCategory: 'reuses',
  filterDefs: () => ({
    search: useStringSearchParam('q')
  }),
  buildQuery: (filters, sortValue, page, pageSize) => {
    const query: Record<string, string | number> = {
      select: 'slug,config,updatedAt,-_id',
      size: pageSize,
      page
    }
    if (filters.search.value) query.q = filters.search.value
    if (sortValue) query.sort = sortValue
    return query
  },
  mockDataFactory: () => Array.from({ length: 6 }, (_, i) => ({
    _id: `reuse-${i + 1}`,
    slug: `reuse-${i + 1}`,
    title: `Réutilisation ${i + 1}`,
    config: {
      title: `Réutilisation ${i + 1}`,
      summary: 'Exemple de réutilisation pour la prévisualisation.',
      author: 'Auteur exemple'
    },
    updatedAt: new Date().toISOString()
  }))
})

const sortItems = [
  { title: t('sort.title'), value: 'title' },
  { title: t('sort.updatedAt'), value: 'updatedAt' }
]
</script>

<i18n lang="yaml">
  en:
    reusesCount: 'No reuse | {count} reuse | {count} reuses'
    sort:
      title: Alphabetical order
      updatedAt: Update date
  fr:
    reusesCount: 'Aucune réutilisation | {count} réutilisation | {count} réutilisations'
    sort:
      title: Ordre alphabétique
      updatedAt: Date de mise à jour
</i18n>
