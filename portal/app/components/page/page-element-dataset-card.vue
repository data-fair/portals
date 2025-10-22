<template>
  <dataset-card
    v-if="datasetFetch.data?.value"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :dataset="datasetFetch.data?.value"
    :card-config="element.usePortalConfig ? portalConfig.datasets.card : { ...portalConfig.datasets.card, ...element.cardConfig }"
  />
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import type { DatasetCardElement } from '#api/types/page-config'

type Dataset = {
  id: string
  slug: string
  title: string
  description: string
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

const { element } = defineProps<{ element: DatasetCardElement }>()
const { preview, portalConfig } = usePortalStore()

const fetch = preview ? useFetch<Dataset> : useLocalFetch<Dataset>
const datasetFetch = fetch('/data-fair/api/v1/datasets/' + element.dataset?.id, { immediate: false })

watch(() => element.dataset?.id, (id) => {
  if (id) datasetFetch.refresh()
}, { immediate: true })

</script>
