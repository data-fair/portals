<template>
  <v-list-item
    v-for="(attachment, i) of dataset.attachments?.filter(a => a.url !== dataset.image)"
    :key="i"
    :title="attachment.title"
  >
    <v-list-item-subtitle v-if="attachment.type === 'file'">
      {{ attachment.name }} - {{ formatBytes(attachment.size) }} - {{ t('updatedAt') }} {{
      dayjs(attachment.updatedAt).format('LL') }}
    </v-list-item-subtitle>
    <v-list-item-subtitle v-if="attachment.type === 'remoteFile'">
      {{ attachment.name }}
    </v-list-item-subtitle>
    <!--eslint-disable-next-line vue/no-v-html -->
    <div v-html="attachment.description" />
    <template #append>
      <v-btn
        :icon="attachmentMode(attachment) === 'open' ? mdiOpenInNew : mdiDownload"
        :href="attachment.url"
        :title="(attachmentMode(attachment) === 'open' ? t('openInNewWindow') : t('download'))"
        target="_blank"
        rel="noopener"
        variant="text"
      />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import type { Dataset } from '#api/types/index.ts'
import { mdiDownload, mdiOpenInNew } from '@mdi/js'
import formatBytes from '@data-fair/lib-vue/format/bytes.js'

const { dataset } = defineProps<{ dataset: Pick<Dataset, 'image' | 'attachments'> }>()
const { t } = useI18n()
const { dayjs } = useLocaleDayjs()

const attachmentMode = (attachment: { type: string; mimetype?: string }) => {
  if (attachment.type === 'url' || attachment.mimetype === 'application/pdf' || (attachment.mimetype && attachment.mimetype.startsWith('image/'))) return 'open'
  return 'download'
}

</script>

<i18n lang="yaml">
  en:
    download: Download
    openInNewWindow: Open in new window
    updatedAt: Updated at
  fr:
    download: Télécharger
    openInNewWindow: Ouvrir dans une nouvelle fenêtre
    updatedAt: Mis à jour le
</i18n>
