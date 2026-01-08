<template>
  <dataset-card
    v-if="datasetFetch.data?.value"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :dataset="datasetFetch.data?.value"
    :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.datasets.card"
    :is-portal-config="element.usePortalConfig || !element.cardConfig"
  />
</template>

<script setup lang="ts">
import type { Dataset } from '#api/types/index.ts'
import type { DatasetCardElement } from '#api/types/page-config'

const { element } = defineProps<{ element: DatasetCardElement }>()
const { preview, portalConfig } = usePortalStore()

const fetch = preview ? useFetch<Dataset> : useLocalFetch<Dataset>
const datasetFetch = fetch('/data-fair/api/v1/datasets/' + element.dataset?.id, { immediate: false })

watch(() => element.dataset?.id, (id) => {
  if (id) datasetFetch.refresh()
}, { immediate: true })

</script>
