<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="portalConfig.datasets.page.metadata?.actionsStyle"
    :icon="mdiAttachment"
    :resource-title="dataset.title"
    :text="t('preview')"
    :track-path="`/datasets/${dataset.slug}/attachments-dialog`"
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
    preview: Attachments
  fr:
    preview: Pièces jointes
</i18n>
