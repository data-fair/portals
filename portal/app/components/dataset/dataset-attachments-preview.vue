<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="portalConfig.datasets.page.actionsStyle"
    :icon="mdiAttachment"
    :text="t('preview')"
    :track-path="`/datasets/${dataset.slug}/attachments-dialog`"
  >
    <dataset-attachments :dataset="dataset" />
  </layout-preview>
</template>

<script setup lang="ts">
import { mdiAttachment } from '@mdi/js'

type Dataset = {
  title: string
  slug: string,
  attachments: {
    url: string
    title: string
    name: string
    type: 'file' | 'remoteFile'
    description: string
    size: string
    updatedAt: string
  }[]
  image?: string
}

const { dataset } = defineProps<{ dataset: Dataset }>()
const { t } = useI18n()
const { portalConfig } = usePortalStore()
</script>

<i18n lang="yaml">
  en:
    preview: Attachments
  fr:
    preview: Pièces jointes
</i18n>
