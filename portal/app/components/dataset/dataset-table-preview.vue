<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="actionStyle"
    :icon="mdiTableEye"
    :text="t('preview')"
    :short-text="t('previewShort')"
  >
    <d-frame-wrapper
      :iframe-title="t('preview') + ' - ' + dataset.title"
      :src="`/data-fair/embed/dataset/${dataset.id}/table`"
      scrolling="no"
      aspect-ratio
    />
  </layout-preview>
</template>

<script setup lang="ts">
import type { DatasetCard } from '#api/types/portal/index.js'
import { mdiTableEye } from '@mdi/js'

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
    preview: Table preview
    previewShort: Preview
  fr:
    preview: Aperçu du tableau
    previewShort: Aperçu
</i18n>
