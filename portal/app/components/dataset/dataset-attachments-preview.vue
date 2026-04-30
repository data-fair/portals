<template>
  <layout-preview
    :title="t('title') + ' - ' + dataset.title"
    :action-style="portalConfig.datasets.page.metadata?.actionsStyle"
    :icon="mdiAttachment"
    :resource-title="dataset.title"
    :text="t('text')"
    :tooltip="t('tooltip')"
    :track-dialog="{ action: 'dataset-attachments', label: dataset.slug }"
  >
    <dataset-attachments :dataset="dataset" />
  </layout-preview>
</template>

<script setup lang="ts">
import type { Dataset } from '#api/types/index.ts'
import { mdiAttachment } from '@mdi/js'

const { dataset } = defineProps<{ dataset: Pick<Dataset, 'title' | 'slug' | 'image' | 'attachments'> }>()
const { t } = useI18n()
const { portalConfig } = usePortalStore()
</script>

<i18n lang="yaml">
  en:
    title: Attachments
    text: Attachments
    tooltip: Open the attachments in a dialog
  fr:
    title: Pièces jointes
    text: Pièces jointes
    tooltip: Ouvrir les pièces jointes dans une boîte de dialogue
</i18n>
