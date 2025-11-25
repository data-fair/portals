<template>
  <d-frame-wrapper
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :iframe-title="`${t('datasetTable')} - ${element.dataset.title}`"
    :src="url"
    :sync-params="element.syncParams ? '*:' + element.dataset.id + '-table_' : undefined"
    scrolling="no"
    aspect-ratio
    emit-iframe-messages
    @iframe-message="(iframeMessage: CustomEvent) => onIframeMessage(iframeMessage.detail)"
  />
</template>

<script setup lang="ts">
import type { DatasetTable } from '#api/types/page-config'

const { element } = defineProps<{ element: DatasetTable }>()
const { t } = useI18n()

const url = computed(() => {
  let ret = `/data-fair/embed/dataset/${element.dataset.id}/table?interaction=${element.interactions}`
  if (element.display) ret += `&display=${element.display}`
  if (element.cols && element.cols.length) ret += `&cols=${element.cols.join(',')}`
  return ret
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onIframeMessage = (message: any) => {
  if (message) useAnalytics()?.track(message.trackEvent.action, message.trackEvent)
}

</script>

<i18n lang="yaml">
  en:
    datasetTable: Table
  fr:
    datasetTable: Tableau
</i18n>
