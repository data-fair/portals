<template>
  <v-container data-iframe-height>
    <v-card v-if="searchIndexesFetch.data.value">
      <v-card-title>
        {{ t('title') }}
      </v-card-title>
      <v-card-text>
        <v-alert
          v-if="!portalFetch.data.value?.config.searchEngine?.active"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          {{ t('searchEngineNotActive') }}
        </v-alert>

        <v-data-table
          v-if="searchIndexesFetch.data.value.results.length"
          :headers="headers"
          :items="searchIndexesFetch.data.value.results"
          :loading="searchIndexesFetch.loading.value"
          item-value="_id"
        >
          <template #item.path="{ item }">
            <code>{{ item.path }}</code>
          </template>
          <template #item.resource.type="{ item }">
            <v-chip size="small">
              {{ item.resource.type }}
            </v-chip>
          </template>
          <template #item.indexingStatus="{ item }">
            <v-chip
              :color="statusColor(item.indexingStatus)"
              size="small"
            >
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
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { mdiMagnify } from '@mdi/js'
import type { Portal } from '#api/types/portal'

const { t } = useI18n()
const route = useRoute<'/portals/[id]/search-indexes'>()

const portalFetch = useFetch<Portal>($apiPath + '/portals/' + route.params.id)

const searchIndexesFetch = useFetch<{ results: any[], count: number }>($apiPath + '/search-page', {
  query: {
    portal: route.params.id,
    size: 1000
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
    text: t('searchIndexes'),
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
    case 'toIndex': return 'warning'
    case 'toDelete': return 'error'
    default: return 'grey'
  }
}

</script>

<i18n lang="yaml">
en:
  title: Search Page Indexes
  portals: Portals
  searchIndexes: Search indexes
  resourceType: Type
  path: Path
  status: Status
  indexedAt: Indexed at
  searchEngineNotActive: The search engine is not active for this portal
  noIndexes: No indexed pages
fr:
  title: Indexation des pages de recherche
  portals: Portails
  searchIndexes: Indexation de recherche
  resourceType: Type
  path: Chemin
  status: Statut
  indexedAt: Indexé le
  searchEngineNotActive: Le moteur de recherche n'est pas actif pour ce portail
  noIndexes: Aucune page indexée
</i18n>
