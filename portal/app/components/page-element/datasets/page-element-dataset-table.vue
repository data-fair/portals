<template>
  <d-frame-wrapper
    v-if="element.dataset && url"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :iframe-title="`${t('datasetTable')} - ${element.dataset.title}`"
    :src="url"
    :sync-params="syncParams"
    scrolling="no"
    aspect-ratio
    emit-iframe-messages
    @iframe-message="(iframeMessage: CustomEvent) => !preview ? onIframeTrackMessage(iframeMessage.detail) : undefined"
  />
</template>

<script setup lang="ts">
import type { DatasetTable } from '#api/types/page-elements/index.ts'
import { usePageFilterDescribeTool } from '../../../composables/agent/page-filter-describe-tool'

const { element } = defineProps<{ element: DatasetTable }>()
const { t } = useI18n()
const { preview } = usePortalStore()

// A shared-filters dataset table reflects all page filters (concept + dataset-specific).
if (element.syncParams === 'shared-filters' && element.uuid) {
  usePageFilterDescribeTool({
    uuid: element.uuid,
    title: `Filtres : ${element.dataset?.title ?? 'tableau'}`,
    description: `This page has a dataset table "${element.dataset?.title ?? ''}" that reflects all page filters: concept filters (keys starting with "_c") and dataset-specific filters (keys starting with "_d_${element.dataset?.id}_"). Use pageFilters_set to drive it.`
  })
}

const syncParams = computed(() => {
  const uuid = element.uuid || crypto.randomUUID().split('-')[0] // Prevent undefined uuid
  if (element.syncParams === 'sandboxed') return `*:${uuid}_`
  if (element.syncParams === 'shared-filters') return `_c*,*_*:_d_${element.dataset?.id}_,*:${uuid}_`
  return undefined
})

const url = computed(() => {
  if (!element.dataset) return
  const route = element.editable ? 'table-edit' : 'table'
  let ret = `/data-fair/embed/dataset/${element.dataset.id}/${route}?interaction=${element.interactions}`
  if (element.display) ret += `&display=${element.display}`
  if (element.cols && element.cols.length) ret += `&cols=${element.cols.join(',')}`
  return ret
})

</script>

<i18n lang="yaml">
  en:
    datasetTable: Table
  fr:
    datasetTable: Tableau
</i18n>
