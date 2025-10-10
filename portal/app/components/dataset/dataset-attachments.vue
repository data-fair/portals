<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="portalConfig.datasets.actionsStyle"
    :icon="mdiAttachment"
    :text="t('preview')"
  >
    <v-list-item
      v-for="(attachment, i) of dataset.attachments.filter(a => a.url !== dataset.image)"
      :key="i"
      :title="attachment.title"
    >
      <v-list-item-subtitle v-if="attachment.type === 'file'">
        {{ attachment.name }} - {{ attachment.size }} - mis à jour le {{ dayjs(attachment.updatedAt).format('LL') }}
      </v-list-item-subtitle>
      <v-list-item-subtitle v-if="attachment.type === 'remoteFile'">
        {{ attachment.name }}
      </v-list-item-subtitle>
      <div v-html="attachment.description" />
      <template #append>
        <v-btn
          :icon="attachmentMode(attachment) === 'open' ? mdiOpenInNew : mdiDownload"
          :href="attachment.url"
          target="_blank"
          rel="noopener"
          variant="text"
        />
      </template>
    </v-list-item>
  </layout-preview>
</template>

<script setup lang="ts">
import { mdiAttachment, mdiDownload, mdiOpenInNew } from '@mdi/js'

type Dataset = {
  title: string
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
const { dayjs } = useLocaleDayjs()

const attachmentMode = (attachment: { type: string; mimetype?: string }) => {
  if (attachment.type === 'url' || attachment.mimetype === 'application/pdf' || (attachment.mimetype && attachment.mimetype.startsWith('image/'))) return 'open'
  return 'download'
}

</script>

<i18n lang="yaml">
  en:
    preview: Attachments
  fr:
    preview: Pièces jointes
</i18n>
