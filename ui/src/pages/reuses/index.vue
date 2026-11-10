<template>
  <v-container data-iframe-height>
    <!-- Skeleton loader-->
    <v-row
      v-if="reusesFetch.loading.value"
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

    <!-- No reuses, or none matching the filters -->
    <df-layout-empty-state
      v-else-if="!displayReuses.length"
      :btn-text="t('createReuse')"
      :has-search="isFiltered"
      :icon="mdiPageNext"
      :no-data-text="t('noReusesCreated')"
      :no-result-text="t('noReusesDisplayed')"
      btn-to="/reuses/new"
      can-create
    />

    <!-- List of reuses -->
    <v-row
      v-else
      class="d-flex align-stretch df-card-grid"
    >
      <v-col
        v-for="reuse in displayReuses"
        :key="reuse._id"
        md="4"
        sm="6"
        cols="12"
      >
        <reuse-card-ui
          :reuse="reuse"
          :portals-by-id="portalsById"
        />
      </v-col>
    </v-row>

    <!-- Actions -->
    <reuses-actions
      v-model:search="search"
      v-model:sort="sort"
      v-model:show-all="showAll"
      v-model:portals-selected="portals"
      v-model:requested-portals-selected="requestedPortals"
      :facets="facets"
    />
  </v-container>
</template>

<script setup lang="ts">
import { mdiPageNext } from '@mdi/js'
import type { ReusesGetRes, ReusesFacets } from '#api/doc/reuses/get-res'
import type { Portal } from '#api/types/portal'

const showAll = useBooleanSearchParam('showAll')
const search = useStringSearchParam('q')
const sort = useStringSearchParam('sort', 'createdAt:-1')
const portals = useStringsArraySearchParam('portal')
const requestedPortals = useStringsArraySearchParam('requestedPortal')
const { t } = useI18n()

const reusesParams = computed(() => {
  const params: Record<string, any> = {
    size: 10000,
    sort: sort.value,
    select: '_id,title,owner,submitter,createdAt,updatedAt,portals,requestedPortals,config.author,config.datasets'
  }
  if (portals.value.length) params.portal = portals.value.join(',')
  if (requestedPortals.value.length) params.requestedPortal = requestedPortals.value.join(',')
  if (showAll.value) params.showAll = 'true'
  return params
})

const reusesFetch = useFetch<ReusesGetRes>($apiPath + '/reuses', { query: reusesParams })
const facets = computed<ReusesFacets>(() => reusesFetch.data.value?.facets ?? { portals: {}, requestedPortals: {} })

// title and url of the portals for the publication sites of the cards
const portalsLookupFetch = useFetch<{ results: Pick<Portal, '_id' | 'title' | 'ingress'>[] }>($apiPath + '/portals', {
  query: computed(() => ({ select: '_id,title,ingress', size: 10000, showAll: showAll.value || undefined }))
})
const portalsById = computed(() => {
  const map: Record<string, { title: string, url: string }> = {}
  for (const portal of portalsLookupFetch.data.value?.results ?? []) {
    map[portal._id] = { title: portal.title, url: portal.ingress?.url || $uiConfig.portalUrlPattern.replace('{subdomain}', portal._id) }
  }
  return map
})
const isFiltered = computed(() => !!search.value || portals.value.length > 0 || requestedPortals.value.length > 0)
const displayReuses = computed(() => {
  const reuses = (reusesFetch.data.value?.results ?? [])
  if (!search.value) return reuses
  return reuses.filter(reuse => reuse.title.toLowerCase().includes(search.value.toLowerCase()))
})

watch(
  [() => reusesFetch.data.value?.count, () => displayReuses.value.length],
  ([count, displayed]) => {
    setBreadcrumbs([{ text: t('reusesDisplayed', { count: count ?? 0, displayed }) }])
  },
  { immediate: true }
)

</script>

<i18n lang="yaml">
  en:
    createReuse: Create a new reuse
    noReusesCreated: You haven't created any reuses yet.
    noReusesDisplayed: No results match the search criteria.
    reusesDisplayed: No reuses | {displayed}/{count} reuse displayed | {displayed}/{count} reuses displayed

  fr:
    createReuse: Créer une nouvelle réutilisation
    noReusesCreated: Vous n'avez pas encore créé de réutilisation.
    noReusesDisplayed: Aucun résultat ne correspond aux critères de recherche.
    reusesDisplayed: Aucune réutilisation | {displayed}/{count} réutilisation affichée | {displayed}/{count} réutilisations affichées

</i18n>
