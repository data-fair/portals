<template>
  <layout-preview
    :icon="mdiMapMarker"
    :text="t('preview')"
    :short-text="t('previewShort')"
    :title="t('preview') + ' - ' + dataset.title"
  >
    <d-frame-wrapper
      :iframe-title="t('previewShort') + ' - ' + dataset.title"
      :src="`/data-fair/next-ui/embed/dataset/${dataset.id}/map`"
      aspect-ratio
    />
  </layout-preview>
</template>

<script setup lang="ts">
import { mdiMapMarker } from '@mdi/js'

const { dataset } = defineProps<{
  dataset: {
    id: string
    title: string
  }
}>()
const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    preview: Generic map
    previewShort: Map
  fr:
    preview: Carte générique
    previewShort: Carte
</i18n>
