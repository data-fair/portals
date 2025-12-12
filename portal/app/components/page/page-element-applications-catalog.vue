<template>
  <!-- Page Title -->
  <h4
    v-if="element.applicationsCountPosition === 'top'"
    class="text-h4 mb-4"
  >
    {{ t('applicationsCount', { count: applicationsCount }) }}
  </h4>

  <!-- Standard Filters -->
  <v-row
    v-if="element.filters?.items?.length"
    class="my-0"
  >
    <catalog-filters
      :config="element"
      catalog-type="applications"
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

  <!-- Applications Count + Order -->
  <v-row
    v-if="element.applicationsCountPosition === 'bottom'"
    class="mt-2"
    align="end"
  >
    <v-col>{{ t('resultsCount', { count: applicationsCount }) }}</v-col>
    <v-col
      cols="12"
      md="6"
      lg="4"
    >
      <v-select
        v-if="element.showSortBesideCount"
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

  <!-- Applications -->
  <v-row class="d-flex align-stretch mt-2">
    <v-col
      v-for="application in displayedApplications"
      :key="application.id"
      :md="12 / (element.columns || 2)"
      cols="12"
    >
      <application-card
        :application="application"
        :card-config="portalConfig.applications.card"
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
</template>

<script setup lang="ts">
import type { Application } from '#api/types/index.ts'
import type { PageElement, ApplicationsCatalogElement } from '#api/types/page'
import { mdiSortAscending, mdiSortDescending } from '@mdi/js'

type ApplicationFetch = { count: number; results: Application[] }

const { element } = defineProps<{ element: ApplicationsCatalogElement }>()
const { portal, portalConfig, preview } = usePortalStore()
const { t } = useI18n()

const filters = {
  search: useStringSearchParam('q'),
  baseApplication: useStringsArraySearchParam('base-application'),
  topics: useStringsArraySearchParam('topics'),
  owners: useStringsArraySearchParam('owner'),
  sort: useStringSearchParam('sort', { default: element.defaultSort })
}

const sort = ref<string>()
const order = ref<'-1' | '1'>()

// Infinite scroll state / pagination state
const paginationPosition = computed(() => element.pagination?.position || 'none')
const currentPage = ref(1)
const displayedApplications = ref<Application[]>([])
const loading = ref(false)
const pageSize = 20

let applicationsFetch: ReturnType<typeof useLocalFetch<ApplicationFetch>> | undefined
if (!preview) {
  const applicationsQuery = computed(() => {
    const query: Record<string, string | number> = {
      select: 'id,slug,title,summary,updatedAt,image,url,topics,-userPermissions',
      publicationSites: 'data-fair-portals:' + portal.value._id,
      truncate: 250,
      size: pageSize,
      page: currentPage.value
    }
    if (filters.search.value) query.q = filters.search.value
    if (filters.baseApplication.value?.length) query['base-application'] = filters.baseApplication.value.join(',')
    if (filters.topics.value?.length) query.topics = filters.topics.value.join(',')
    if (filters.owners.value?.length) query.owner = filters.owners.value.join(',')
    if (filters.sort.value) query.sort = filters.sort.value
    return query
  })
  applicationsFetch = useLocalFetch<ApplicationFetch>('/data-fair/api/v1/applications', { query: applicationsQuery, watch: false })
}

// TODO: Track applications search ?
// Track searches
// if (!preview) {
//   // TODO: ask if params are tracked, in this case, this track is useless
//   watch(filters.search, () => {
//     if (filters.search.value) useAnalytics()?.track('search', { category: 'datasets', label: filters.search.value })
//   })
// }

// Computed property to check if there are more datasets to load (for infinite scroll)
const hasMore = computed(() => {
  if (preview || paginationPosition.value !== 'none') return false
  return displayedApplications.value.length < (applicationsFetch?.data.value?.count || 0)
})

const applicationsCount = computed(() => preview ? displayedApplications.value.length : (applicationsFetch?.data.value?.count || 0))

// Total pages for pagination
const totalPages = computed(() => {
  if (preview) return 1
  return Math.ceil((applicationsFetch?.data.value?.count || 0) / pageSize)
})

// Function to go to a specific page (for pagination)
const goToPage = async (page: number) => {
  if (preview || !applicationsFetch) return
  loading.value = true
  try {
    currentPage.value = page
    await applicationsFetch.refresh()
    if (applicationsFetch.data.value?.results) {
      displayedApplications.value = [...applicationsFetch.data.value.results]
    }
    // goTo(catalogTop.value)
  } finally {
    loading.value = false
  }
}

// Function to load more datasets (for infinite scroll)
const loadMore = async () => {
  if (preview || loading.value || !hasMore.value || !applicationsFetch || paginationPosition.value !== 'none') return
  loading.value = true
  try {
    currentPage.value++
    await applicationsFetch?.refresh()
    if (applicationsFetch?.data.value?.results) {
      displayedApplications.value.push(...applicationsFetch.data.value.results)
    }
  } finally {
    loading.value = false
  }
}

// Initialize datasets on mount
if (!preview) {
  onMounted(async () => {
    await applicationsFetch?.refresh()
    if (applicationsFetch?.data.value?.results) {
      displayedApplications.value = [...applicationsFetch.data.value.results]
    }
  })
} else {
  // Mock data for preview
  displayedApplications.value = Array.from({ length: 6 }, (_, i) => {
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
      owner: { id: 'owner-1', name: 'Organisation exemple', type: 'organization' },
      topics: [{ id: 'topic-1', title: 'Thématique exemple', color: '#45d31d' }]
    }
  })
}

// Reset datasets when filters change
if (!preview) {
  watch([filters.search, filters.sort, filters.baseApplication, filters.topics, filters.owners], async () => {
    currentPage.value = 1
    await applicationsFetch?.refresh()
    if (applicationsFetch?.data.value?.results) {
      displayedApplications.value = [...applicationsFetch.data.value.results]
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
  { title: t('sort.updatedAt'), value: 'updatedAt' },
  { title: t('sort.title'), value: 'title' }
]

</script>

<i18n lang="yaml">
  en:
    applicationsCount: '{count} application | {count} applications'
    ascending: Ascending order
    descending: Descending order
    resultsCount: '{count} result | {count} results'
    sort:
      by: Sort by
      createdAt: Creation date
      title: Alphabetical order
      updatedAt: Update date

  fr:
    applicationsCount: '{count} visualisation | {count} visualisations'
    ascending: Ordre croissant
    descending: Ordre décroissant
    resultsCount: '{count} résultat | {count} résultats'
    sort:
      by: Trier par
      createdAt: Date de création
      title: Ordre alphabétique
      updatedAt: Date de mise à jour
</i18n>
