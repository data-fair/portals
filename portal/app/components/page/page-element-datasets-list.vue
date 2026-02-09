<template>
  <v-row :class="['d-flex align-stretch', element.mb !== 0 && `mb-${element.mb ?? 4}`]">
    <v-col
      v-for="dataset in displayedDatasets"
      :key="dataset.id"
      :md="12 / element.columns"
      cols="12"
    >
      <dataset-card
        :dataset="dataset"
        :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.datasets.card"
        :is-portal-config="element.usePortalConfig || !element.cardConfig"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Dataset } from '#api/types/index.ts'
import type { DatasetsListElement } from '#api/types/page-elements/index.ts'

type DatasetFetch = { count: number; results: Omit<Dataset, 'userPermissions'>[] }

const { element } = defineProps<{ element: DatasetsListElement }>()
const { portal, portalConfig, preview } = usePortalStore()

let displayedDatasets: ComputedRef<DatasetFetch['results']>

if (!preview) {
  const ids = element.datasets?.map(d => d.id) || []
  const datasetsQuery = computed(() => ({
    select: 'id,slug,title,summary,dataUpdatedAt,updatedAt,extras,bbox,topics,keywords,image,isMetaOnly,-userPermissions',
    ids: element.mode === 'custom' ? ids.join(',') : undefined,
    publicationSites: 'data-fair-portals:' + portal.value._id,
    truncate: 250,
    size: element.mode !== 'custom' ? element.limit : undefined,
    sort: element.mode === 'lastUpdated' ? 'dataUpdatedAt:-1' : element.mode === 'lastCreated' ? 'createdAt:-1' : undefined
  }))

  const datasetsFetch = useLocalFetch<DatasetFetch>('/data-fair/api/v1/datasets', { query: datasetsQuery })
  displayedDatasets = computed(() => {
    const results = datasetsFetch.data.value?.results || []
    if (element.mode === 'custom') return [...results].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)) // order by element.datasets
    return results
  })
} else {
  // Mock data for preview
  displayedDatasets = computed(() => {
    return Array.from({ length: element.mode === 'custom' ? (element.datasets?.length || 1) : element.limit }, (_, i) => ({
      id: `dataset-${i + 1}`,
      slug: `dataset-${i + 1}`,
      title: element.datasets?.[i]?.title || `Dataset ${i + 1}`,
      summary: 'Ceci est un exemple de jeu de données pour la prévisualisation.',
      dataUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: { id: 'owner-1', name: "Organisation d'exemple", type: 'organization' },
      topics: [{ id: 'topic-1', title: "Thématique d'exemple", color: '#45d31d' }],
      isMetaOnly: false,
      extras: {}
    }))
  })
}

</script>
