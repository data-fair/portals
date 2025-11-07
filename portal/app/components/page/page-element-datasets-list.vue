<template>
  <v-row :class="['d-flex align-stretch', element.mb !== 0 && `mb-${element.mb ?? 4}`]">
    <v-col
      v-for="dataset in datasets"
      :key="dataset.id"
      :md="12 / element.columns"
      cols="12"
    >
      <dataset-card
        :dataset="dataset"
        :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.datasets.card"
        :is-portal-config="element.usePortalConfig"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import type { DatasetsListElement } from '#api/types/page-elements'

type Dataset = {
  id: string
  slug: string
  title: string
  summary: string
  dataUpdatedAt: string
  updatedAt: string
  owner: Account
  extras: {
    applications?: { id: string; updatedAt: string }[]
  }
  bbox?: number[]
  topics: { id: string; title: string; color: string }[]
  keywords?: string[]
  image?: string
  isMetaOnly: boolean
}

type DatasetFetch = {
  count: number
  results: Dataset[]
}

const { element } = defineProps<{ element: DatasetsListElement }>()
const { portal, portalConfig, preview } = usePortalStore()

let datasets: Dataset[] | ComputedRef<Dataset[]>

if (!preview) {
  const ids = element.datasets?.map(d => d.id) || []
  const datasetsQuery = computed(() => ({
    select: 'id,slug,title,summary,dataUpdatedAt,updatedAt,extras,bbox,topics,keywords,image,isMetaOnly,-userPermissions',
    ids: element.mode === 'custom' ? ids.join(',') : undefined,
    publicationSites: 'data-fair-portals:' + portal.value._id,
    truncate: 250,
    size: element.mode !== 'custom' ? element.limit : 100,
    sort: element.mode === 'lastUpdated' ? 'updatedAt: -1' : element.mode === 'lastCreated' ? 'createdAt:-1' : undefined
  }))

  const datasetsFetch = useLocalFetch<DatasetFetch>('/data-fair/api/v1/datasets', { query: datasetsQuery })
  datasets = computed(() => {
    const results = datasetsFetch.data.value?.results || []
    if (element.mode === 'custom') return [...results].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)) // order by element.datasets
    return results
  })
} else {
  // Mock data for preview
  datasets = computed(() => {
    return Array.from({ length: element.mode === 'custom' ? (element.datasets?.length || 1) : element.limit }, (_, i) => ({
      id: `dataset-${i + 1}`,
      slug: `dataset-${i + 1}`,
      title: element.datasets?.[i]?.title || `Dataset ${i + 1}`,
      summary: 'Ceci est un exemple de jeu de données pour la prévisualisation.',
      dataUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: { id: 'owner-1', name: 'Organisation exemple', type: 'organization' } as Account,
      extras: {},
      topics: [{ id: 'topic-1', title: 'Topic exemple', color: '#45d31d' }],
      isMetaOnly: false
    }))
  })
}

</script>
