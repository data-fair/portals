<template>
  <d-frame-wrapper
    :iframe-title="`${t('datasetForm')} - ${element.dataset.title}`"
    :src="`/data-fair/next-ui/embed/dataset/${element.dataset.id}/form`"
    :sync-params="element.syncParams ? '*:' + element.dataset.id + '-form_' : undefined"
    scrolling="no"
    aspect-ratio
  />
</template>

<script setup lang="ts">
import type { DatasetForm } from '#api/types/page-config'

const { element } = defineProps<{ element: DatasetForm }>()
const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    datasetForm: Form
  fr:
    datasetForm: Formulaire
</i18n>
