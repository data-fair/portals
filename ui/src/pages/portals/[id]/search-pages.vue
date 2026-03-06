<template>
  <v-container data-iframe-height>
    <v-alert
      v-if="!portalFetch.data.value?.config.searchEngine?.active"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      {{ t('searchEngineNotActive') }}
    </v-alert>

    <template v-if="searchPagesFetch.data.value">
      <template v-if="searchPagesFetch.data.value.results.length">
        <v-card :title="t('indexingState')">
          <v-data-table
            :headers="headers"
            :items="searchPagesFetch.data.value.results"
            :loading="searchPagesFetch.loading.value"
            item-value="_id"
            :items-per-page="10000"
            hide-default-footer
          >
            <template #item.path="{ item }">
              <code>{{ item.path }}</code>
            </template>
            <template #item.resource.type="{ item }">
              {{ item.resource.type }}
            </template>
            <template #item.indexingStatus="{ item }">
              <v-chip :color="statusColor(item.indexingStatus)">
                {{ item.indexingStatus }}
              </v-chip>
            </template>
            <template #item.indexedAt="{ item }">
              {{ item.indexedAt ? new Date(item.indexedAt).toLocaleString() : '-' }}
            </template>
          </v-data-table>
        </v-card>

        <v-card
          :title="t('results')"
          class="my-6"
        >
          <search-field
            v-model="searchQuery"
            style="max-width:500px;"
            :loading="fetchResults.loading.value"
          />

          <template v-if="fetchResults.data.value?.results.length">
            <v-list>
              <v-list-item
                v-for="result in fetchResults.data.value?.results"
                :key="result.path"
                :title="result.title"
                :subtitle="result.description"
                :prepend-icon="resourceTypeIcon(result.resourceType)"
                :href="portalUrl + result.path"
                target="_blank"
              />
            </v-list>
          </template>
        </v-card>
      </template>

      <v-empty-state
        v-else
        :icon="mdiMagnify"
        :title="t('noIndexes')"
      />
    </template>
  </v-container>
</template>

<i18n lang="yaml">
en:
  title: Pages indexing
  portals: Portals
  resourceType: Type
  path: Path
  status: Status
  indexedAt: Indexed at
  searchEngineNotActive: The search engine is not active for this portal
  noIndexes: No indexed pages
  indexingState: Indexing state
  results: Results
fr:
  title: Indexation des pages
  portals: Portails
  resourceType: Type
  path: Chemin
  status: Statut
  indexedAt: Indexé le
  searchEngineNotActive: Le moteur de recherche n'est pas actif pour ce portail
  noIndexes: Aucune page indexée
  indexingState: État de l'indexation
  results: Résultats
</i18n>

<script lang="ts" setup>
import { mdiMagnify, mdiFileDocument, mdiFolder, mdiDatabase, mdiApps } from '@mdi/js'
import { useWS } from '@data-fair/lib-vue/ws.js'
import SearchField from '@data-fair/lib-vuetify/search-field.vue'
import type { Portal } from '#api/types/portal'

interface SearchEngineResult {
  path: string
  title: string
  description?: string
  resourceType?: string
}

const { t } = useI18n()
const route = useRoute<'/portals/[id]/search-pages'>()

const portalFetch = useFetch<Portal>($apiPath + '/portals/' + route.params.id)

const searchPagesFetch = useFetch<{ results: any[], count: number }>($apiPath + '/search-pages', {
  query: {
    portal: route.params.id,
    size: 10000
  }
})

const searchQuery = ref('')
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
const fetchResults = useFetch<{ results: SearchEngineResult[] }>($apiPath + '/portals/' + route.params.id + '/search', { query: () => ({ q: searchQuery.value }), watch: false, immediate: false })
watch(searchQuery, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => { fetchResults.refresh() }, 300)
}, { immediate: true })

const portalUrl = computed(() => {
  const portal = portalFetch.data.value
  if (!portal) return null
  return portal.ingress?.url || $uiConfig.portalUrlPattern.replace('{subdomain}', portal._id)
})

const resourceTypeIcon = (type?: string) => {
  switch (type) {
    case 'page': return mdiFileDocument
    case 'reuse': return mdiFolder
    case 'dataset': return mdiDatabase
    case 'application': return mdiApps
    default: return mdiMagnify
  }
}

const ws = useWS($apiPath + '/')
ws?.subscribe<{ _id: string; indexingStatus: string; indexedAt?: string }>(`search-pages/${route.params.id}`, (data) => {
  if (!searchPagesFetch.data.value) return
  const results = searchPagesFetch.data.value.results
  const index = results.findIndex(r => r._id === data._id)
  if (data.indexingStatus === 'deleted') {
    if (index !== -1) {
      results.splice(index, 1)
    }
  } else if (index !== -1) {
    results[index] = { ...results[index], ...data }
  } else {
    searchPagesFetch.refresh()
  }
})

watch(portalFetch.data, (portal) => {
  if (!portal) return
  setBreadcrumbs([{
    text: t('portals'),
    to: '/portals'
  }, {
    text: portal.config.title,
    to: '/portals/' + portal._id
  }, {
    text: t('title'),
  }])
})

const headers = [
  { title: t('resourceType'), key: 'resource.type', sortable: true },
  { title: t('path'), key: 'path', sortable: true },
  { title: t('status'), key: 'indexingStatus', sortable: true },
  { title: t('indexedAt'), key: 'indexedAt', sortable: true },
]

const statusColor = (status?: string) => {
  switch (status) {
    case 'ok': return 'success'
    case 'toIndex': return 'primary'
    case 'toDelete': return 'warning'
    case 'error': return 'error'
    default: return 'grey'
  }
}

</script>
