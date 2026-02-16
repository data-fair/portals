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
      v-else-if="!pagesFetch.data.value?.results.length"
      class="d-flex justify-center text-h6 mt-4"
    >
      {{ t('noPagesCreated') }}
    </span>

    <!-- No pages displayed (filters) -->
    <span
      v-else-if="!displayPages.length"
      class="d-flex justify-center text-h6 mt-4"
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
        />
      </v-col>
    </v-row>

    <!-- Actions -->
    <navigation-right>
      <pages-actions
        v-model:search="search"
        v-model:show-all="showAll"
        v-model:portals-selected="portals"
        v-model:types-selected="types"
        v-model:groups-selected="groups"
        v-model:owners-selected="owners"
        :facets="facets"
      />
    </navigation-right>
  </v-container>
</template>

<script setup lang="ts">
import type { Page } from '#api/types/page'
import type { PagesGetRes, PagesFacets } from '#api/doc/pages/get-res'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t } = useI18n()
const showAll = useBooleanSearchParam('showAll')
const search = useStringSearchParam('q')
const portals = useStringsArraySearchParam('portal')
const types = useStringsArraySearchParam('type')
const groups = useStringsArraySearchParam('group')
const owners = useStringsArraySearchParam('owner')

const pagesParams = computed(() => {
  const params: Record<string, any> = {
    size: 1000,
    sort: 'updatedAt:-1',
    select: '_id,title,type,owner,config.description,config.genericMetadata'
  }
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
  return pages.filter(page => {
    if (search.value && !page.title.toLowerCase().includes(search.value.toLowerCase())) return false
    if (!groups.value.length) return true
    return groups.value.includes(getPageGroupId(page))
  })
})

const standardTypes = new Set([
  'home',
  'contact',
  'privacy-policy',
  'accessibility',
  'legal-notice',
  'cookie-policy',
  'terms-of-service',
  'datasets',
  'applications',
  'reuses'
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
