<template>
  <v-container data-iframe-height>
    <!-- Skeleton loader -->
    <v-row
      v-if="pagesFetch.loading.value"
      class="d-flex align-stretch"
    >
      <v-col
        v-for="i in 9"
        :key="i"
        md="4"
        sm="6"
        cols="12"
        class="d-flex"
      >
        <v-skeleton-loader
          :class="$vuetify.theme.current.dark ? 'w-100' : 'w-100 skeleton'"
          height="200"
          type="article"
        />
      </v-col>
    </v-row>

    <!-- No pages created -->
    <span
      v-else-if="!pagesFetch.data.value?.results.length && !isFiltered"
      class="d-flex justify-center text-title-large mt-4"
    >
      {{ t('noPagesCreated') }}
    </span>

    <!-- No pages displayed (filters) -->
    <span
      v-else-if="!displayPages.length"
      class="d-flex justify-center text-title-large mt-4"
    >
      {{ t('noPagesDisplayed') }}
    </span>

    <!-- List of pages -->
    <v-row
      v-else
      class="d-flex align-stretch"
    >
      <v-col
        v-for="page in displayPages"
        :key="page._id"
        md="4"
        sm="6"
        cols="12"
      >
        <page-card
          :page="page"
          :portal-id="portals.length === 1 ? portals[0] : undefined"
        />
      </v-col>
    </v-row>

    <!-- Actions -->
    <pages-actions
      v-model:search="search"
      v-model:sort="sort"
      v-model:show-all="showAll"
      v-model:portals-selected="portals"
      v-model:types-selected="types"
      v-model:groups-selected="groups"
      v-model:owners-selected="owners"
      :facets="facets"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { Page } from '#api/types/page'
import type { PagesGetRes, PagesFacets } from '#api/doc/pages/get-res'

const { t } = useI18n()
const showAll = useBooleanSearchParam('showAll')

// Search with debounce
const q = useStringSearchParam('q')
const search = ref(q.value || '')
let searchTimeout: ReturnType<typeof setTimeout> | undefined
watch(search, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { q.value = val || '' }, 300)
})
watch(q, (val) => { if (val !== search.value) search.value = val || '' })

const sort = useStringSearchParam('sort', 'createdAt:-1')
const portals = useStringsArraySearchParam('portal')
const types = useStringsArraySearchParam('type')
const groups = useStringsArraySearchParam('group')
const owners = useStringsArraySearchParam('owner')

const pagesParams = computed(() => {
  const params: Record<string, any> = {
    size: 1000,
    select: '_id,title,type,owner,config.description,config.genericMetadata'
  }
  if (q.value) params.q = q.value
  else params.sort = sort.value
  if (types.value.length) params.type = types.value.join(',')
  if (portals.value.length) params.portal = portals.value.join(',')
  if (owners.value.length) params.owners = owners.value.join(',')
  if (showAll.value) params.showAll = 'true'
  return params
})
const pagesFetch = useFetch<PagesGetRes>($apiPath + '/pages', { query: pagesParams })
const facets = computed<PagesFacets>(() => pagesFetch.data.value?.facets ?? { types: {}, groups: {} })

const displayPages = computed(() => {
  const pages = (pagesFetch.data.value?.results ?? [])
  if (!groups.value.length) return pages
  return pages.filter(page => groups.value.includes(getPageGroupId(page)))
})

const isFiltered = computed(() => !!q.value || types.value.length > 0 || portals.value.length > 0 || owners.value.length > 0 || groups.value.length > 0)

const standardTypes = new Set([
  'home',
  'contact',
  'accessibility',
  'terms-of-service',
  'legal-notice',
  'privacy-policy',
  'cookie-policy',
  'datasets',
  'applications',
  'reuses',
  'event-catalog',
  'news-catalog'
])

const getPageGroupId = (page: Page) => {
  if (standardTypes.has(page.type)) return 'standard'
  if (page.type === 'event') return 'event'
  if (page.type === 'news') return 'news'
  if (page.type === 'generic' && page.config.genericMetadata?.group?._id) return page.config.genericMetadata.group._id
  return 'default'
}

watch(
  [() => pagesFetch.data.value?.count, () => displayPages.value.length],
  ([count, displayed]) => {
    setBreadcrumbs([{ text: t('pagesDisplayed', { count: count ?? 0, displayed }) }])
  },
  { immediate: true }
)

</script>

<i18n lang="yaml">
  en:
    pages: Pages
    groupTitle:
      standard: Standard pages
      event: Events
      news: News
      default: Other pages
    noPagesCreated: You haven't created any page yet.
    noPagesDisplayed: No result matches your criteria.
    pagesDisplayed: No pages | {displayed}/{count} page displayed | {displayed}/{count} pages displayed

  fr:
    pages: Pages
    groupTitle:
      standard: Pages standard
      event: Événements
      news: Actualités
      default: Autres pages
    noPagesCreated: Vous n'avez pas encore créé de page.
    noPagesDisplayed: Aucun résultat ne correspond à vos critères.
    pagesDisplayed: Aucune page | {displayed}/{count} page affichée | {displayed}/{count} pages affichées

</i18n>
