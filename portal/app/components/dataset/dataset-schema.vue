<template>
  <layout-preview
    :title="t('title') + ' - ' + dataset.title"
    :action-style="portalConfig.datasets.page.metadata?.actionsStyle"
    :icon="mdiViewList"
    :resource-title="dataset.title"
    :text="t('text')"
    :tooltip="t('tooltip')"
    :track-dialog="{ action: 'dataset-schema', label: dataset.slug }"
  >
    <d-frame-wrapper
      :iframe-title="t('title') + ' - ' + dataset.title"
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
    title: Field description
    text: Schema
    tooltip: Open the field description in a dialog
  fr:
    title: Description des champs
    text: Schéma
    tooltip: Ouvrir la description des champs dans une boîte de dialogue
</i18n>
