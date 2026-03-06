<template>
  <d-frame-wrapper
    v-if="element.dataset"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :iframe-title="`${t('datasetDownload')} - ${element.dataset.title}`"
    :src="`/data-fair/embed/dataset/${element.dataset.id}/download?header=true`"
    scrolling="no"
    resize="yes"
    sync-params
  />
</template>

<script setup lang="ts">
import type { DatasetDownloadElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps<{ element: DatasetDownloadElement }>()
const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    datasetDownload: Download
  fr:
    datasetDownload: Téléchargement
</i18n>
