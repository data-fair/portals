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
        :card-config="element.usePortalConfig ? portalConfig.datasets.card : { ...portalConfig.datasets.card, ...element.cardConfig }"
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
  topics: { id: string; title: string }[]
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
  const datasetsQuery = computed(() => ({
    select: 'id,slug,title,summary,dataUpdatedAt,updatedAt,extras,bbox,topics,image,isMetaOnly,-userPermissions',
    publicationSites: 'data-fair-portals:' + portal.value._id,
    truncate: 250,
    size: element.limit,
    sort: 'createdAt:-1' // Latest datasets first
  }))

  const datasetsFetch = useLocalFetch<DatasetFetch>('/data-fair/api/v1/datasets', { query: datasetsQuery })
  datasets = computed(() => datasetsFetch.data.value?.results || [])
} else {
  // Mock data for preview
  datasets = Array.from({ length: Math.min(element.limit, 3) }, (_, i) => ({
    id: `dataset-${i + 1}`,
    slug: `dataset-${i + 1}`,
    title: `Dataset ${i + 1}`,
    summary: 'Ceci est un exemple de jeu de données pour la prévisualisation.',
    dataUpdatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: { id: 'owner-1', name: 'Organisation exemple', type: 'organization' } as Account,
    extras: {},
    topics: [{ id: 'topic-1', title: 'Topic exemple' }],
    isMetaOnly: false
  }))
}

</script>
