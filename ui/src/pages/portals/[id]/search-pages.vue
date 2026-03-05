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
      <v-data-table
        v-if="searchPagesFetch.data.value.results.length"
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

      <v-empty-state
        v-else
        :icon="mdiMagnify"
        :title="t('noIndexes')"
      />
    </template>
  </v-container>
</template>

<script lang="ts" setup>
import { mdiMagnify } from '@mdi/js'
import { useWS } from '@data-fair/lib-vue/ws.js'
import type { Portal } from '#api/types/portal'

const { t } = useI18n()
const route = useRoute<'/portals/[id]/search-pages'>()

const portalFetch = useFetch<Portal>($apiPath + '/portals/' + route.params.id)

const searchPagesFetch = useFetch<{ results: any[], count: number }>($apiPath + '/search-pages', {
  query: {
    portal: route.params.id,
    size: 10000
  }
})

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
fr:
  title: Indexation des pages
  portals: Portails
  resourceType: Type
  path: Chemin
  status: Statut
  indexedAt: Indexé le
  searchEngineNotActive: Le moteur de recherche n'est pas actif pour ce portail
  noIndexes: Aucune page indexée
</i18n>
