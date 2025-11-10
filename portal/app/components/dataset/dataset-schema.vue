<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="portalConfig.datasets.page.actionsStyle"
    :icon="mdiViewList"
    :text="t('preview')"
    :short-text="t('previewShort')"
  >
    <d-frame-wrapper
      :iframe-title="t('preview') + ' - ' + dataset.title"
      :src="`/data-fair/embed/dataset/${dataset.id}/fields`"
      aspect-ratio
    />
  </layout-preview>
</template>

<script setup lang="ts">
import { mdiViewList } from '@mdi/js'

const { dataset } = defineProps<{
  dataset: {
    id: string
    title: string
  }
}>()
const { t } = useI18n()
const { portalConfig } = usePortalStore()

</script>

<i18n lang="yaml">
  en:
    preview: Field description
    previewShort: Schema
  fr:
    preview: Description des champs
    previewShort: Schéma
</i18n>
