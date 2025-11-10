<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="actionStyle"
    :icon="mdiMapMarker"
    :text="t('preview')"
    :short-text="t('previewShort')"
  >
    <d-frame-wrapper
      :iframe-title="t('previewShort') + ' - ' + dataset.title"
      :src="`/data-fair/embed/dataset/${dataset.id}/map`"
      aspect-ratio
    />
  </layout-preview>
</template>

<script setup lang="ts">
import type { DatasetCard } from '#api/types/portal/index.js'
import { mdiMapMarker } from '@mdi/js'

const { dataset } = defineProps<{
  dataset: {
    id: string
    title: string
  }
  actionStyle: DatasetCard['actionsStyle']
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
