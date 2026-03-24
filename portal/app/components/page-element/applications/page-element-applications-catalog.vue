<template>
  <catalog-layout
    catalog-type="applications"
    :element="element"
    :context="context"
    :count-label="t('applicationsCount', { count: itemsCount })"
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
      <application-card
        :application="item"
        :card-config="portalConfig.applications.card"
      />
    </template>
    <template #page-elements="slotProps">
      <slot name="page-elements" v-bind="slotProps" />
    </template>
  </catalog-layout>
</template>

<script setup lang="ts">
import type { Application } from '#api/types/index.ts'
import type { ApplicationsCatalogElement } from '#api/types/page-config'

type ApplicationFilters = {
  search: ReturnType<typeof useStringSearchParam>
  baseApplication: ReturnType<typeof useStringsArraySearchParam>
  topics: ReturnType<typeof useStringsArraySearchParam>
  owners: ReturnType<typeof useStringsArraySearchParam>
}

const { element, context } = defineProps<{
  element: ApplicationsCatalogElement
  context?: { isRoot: boolean, index: number, parentLength: number }
}>()
const { portal, portalConfig } = usePortalStore()
const { t } = useI18n()

const {
  displayedItems, itemsCount, loading, currentPage, totalPages,
  sort, order, goToPage, loadMore
} = useCatalog<Application, ApplicationFilters>(element, {
  endpoint: '/data-fair/api/v1/applications',
  useLocalFetch: true,
  defaultSortFallback: 'createdAt:-1',
  analyticsCategory: 'applications',
  filterDefs: () => ({
    search: useStringSearchParam('q'),
    baseApplication: useStringsArraySearchParam('base-application'),
    topics: useStringsArraySearchParam('topics'),
    owners: useStringsArraySearchParam('owner')
  }),
  buildQuery: (filters, sortValue, page, pageSize) => {
    const query: Record<string, string | number> = {
      select: 'id,slug,title,summary,updatedAt,image,url,topics,-userPermissions',
      publicationSites: 'data-fair-portals:' + portal.value._id,
      truncate: 250,
      size: pageSize,
      page
    }
    if (filters.search.value) query.q = filters.search.value
    if (filters.baseApplication.value?.length) query['base-application'] = filters.baseApplication.value.join(',')
    if (filters.topics.value?.length) query.topics = filters.topics.value.join(',')
    if (filters.owners.value?.length) query.owner = filters.owners.value.join(',')
    if (sortValue) query.sort = sortValue
    return query
  },
  mockDataFactory: () => {
    const session = useSessionAuthenticated()
    return Array.from({ length: 6 }, (_, i) => {
      const slug = `application-${i + 1}`
      return {
        id: slug,
        slug,
        title: `Application ${i + 1}`,
        summary: 'Exemple d\'application pour la prévisualisation.',
        updatedAt: new Date().toISOString(),
        image: undefined,
        url: `/applications/${slug}`,
        href: `/applications/${slug}`,
        exposedUrl: `/applications/${slug}`,
        owner: session.account.value,
        topics: [{ id: 'topic-1', title: 'Thématique exemple', color: '#45d31d' }]
      }
    })
  }
})

const sortItems = [
  { title: t('sort.createdAt'), value: 'createdAt' },
  { title: t('sort.updatedAt'), value: 'updatedAt' },
  { title: t('sort.title'), value: 'title' },
  { title: portalConfig.value?.labelsOverrides?.owner || t('sort.owner'), value: 'owner.departmentName' }
]
</script>

<i18n lang="yaml">
  en:
    applicationsCount: 'No application | {count} application | {count} applications'
    sort:
      createdAt: Creation date
      title: Alphabetical order
      updatedAt: Update date
      owner: Owner

  fr:
    applicationsCount: 'Aucune visualisation | {count} visualisation | {count} visualisations'
    sort:
      createdAt: Date de création
      title: Ordre alphabétique
      updatedAt: Date de mise à jour
      owner: Propriétaire
</i18n>
