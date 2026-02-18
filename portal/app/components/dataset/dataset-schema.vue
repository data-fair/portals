<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="portalConfig.datasets.page.metadata?.actionsStyle"
    :icon="mdiViewList"
    :resource-title="dataset.title"
    :text="t('preview')"
    :short-text="t('previewShort')"
    :track-dialog="{ action: 'dataset-schema', label: dataset.slug }"
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
    slug: string
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
