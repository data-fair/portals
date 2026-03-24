<template>
  <catalog-layout
    catalog-type="news"
    :element="element"
    :context="context"
    :count-label="t('newsCount', { count: itemsCount })"
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
      <news-card
        :page-config="item"
        :card-config="portalConfig.news.card"
        is-portal-config
      />
    </template>
    <template #page-elements="slotProps">
      <slot name="page-elements" v-bind="slotProps" />
    </template>
  </catalog-layout>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page-config'
import type { NewsCatalogElement } from '#api/types/page-elements/index.ts'

const { element, context } = defineProps<{
  element: NewsCatalogElement
  context?: { isRoot: boolean, index: number, parentLength: number }
}>()
const { portalConfig } = usePortalStore()
const { t } = useI18n()

const {
  displayedItems, itemsCount, loading, currentPage, totalPages,
  sort, order, goToPage, loadMore
} = useCatalog<Omit<PageConfig, 'elements'>, { search: ReturnType<typeof useStringSearchParam> }>(element, {
  endpoint: '/portal/api/news',
  defaultSortFallback: 'date:-1',
  filterDefs: () => ({
    search: useStringSearchParam('q')
  }),
  buildQuery: (filters, sortValue, page, pageSize) => {
    const query: Record<string, string | number> = {
      select: '_id,type,config,updatedAt',
      size: pageSize,
      page
    }
    if (filters.search.value) query.q = filters.search.value
    if (sortValue && !(filters.search.value && sortValue === element.defaultSort)) query.sort = sortValue
    return query
  },
  mockDataFactory: () => Array.from({ length: 6 }, (_, i) => ({
    title: `Actualité ${i + 1}`,
    description: 'Exemple d\'actualité pour la prévisualisation.',
    newsMetadata: { slug: `news-${i + 1}`, date: new Date().toISOString() }
  }))
})

const sortItems = [
  { title: t('sort.title'), value: 'title' },
  { title: t('sort.date'), value: 'date' }
]
</script>

<i18n lang="yaml">
  en:
    newsCount: 'No article | {count} article | {count} articles'
    sort:
      title: Alphabetical order
      date: Publication date
  fr:
    newsCount: "Aucune actualité | {count} actualité | {count} actualités"
    sort:
      title: Ordre alphabétique
      date: Date de publication
</i18n>
