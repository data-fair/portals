<template>
  <d-frame-wrapper
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :iframe-title="`${t('datasetTable')} - ${element.dataset.title}`"
    :src="url"
    :sync-params="syncParams"
    scrolling="no"
    aspect-ratio
    emit-iframe-messages
    @iframe-message="(iframeMessage: CustomEvent) => onIframeTrackMessage(iframeMessage.detail)"
  />
</template>

<script setup lang="ts">
import type { DatasetTable } from '#api/types/page-elements/index.ts'

const { element } = defineProps<{ element: DatasetTable }>()
const { t } = useI18n()

const syncParams = computed(() => {
  const uuid = element.uuid || crypto.randomUUID().split('-')[0] // Prevent undefined uuid
  if (element.syncParams === 'sandboxed') return `*:${uuid}_`
  if (element.syncParams === 'shared-filters') return `_c*,*_*:_d_${element.dataset.id}_,*:${uuid}_`
  return undefined
})

const url = computed(() => {
  let ret = `/data-fair/embed/dataset/${element.dataset.id}/table?interaction=${element.interactions}`
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
