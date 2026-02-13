<template>
  <d-frame-wrapper
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :iframe-title="`${t('datasetForm')} - ${element.dataset.title}`"
    :src="`/data-fair/embed/dataset/${element.dataset.id}/form`"
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
