<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="actionStyle"
    :icon="mdiTableEye"
    :text="t('preview')"
    :short-text="t('previewShort')"
    @update:dialog="dialogToggled"
  >
    <d-frame-wrapper
      :iframe-title="t('preview') + ' - ' + dataset.title"
      :src="`/data-fair/embed/dataset/${dataset.id}/table`"
      scrolling="no"
      aspect-ratio
      emit-iframe-messages
      @iframe-message="(iframeMessage: CustomEvent) => onIframeMessage(iframeMessage.detail)"
    />
  </layout-preview>
</template>

<script setup lang="ts">
import type { DatasetCard } from '#api/types/portal/index.js'
import { mdiTableEye } from '@mdi/js'

const { dataset } = defineProps<{
  dataset: {
    id: string
    slug: string
    title: string
  }
  actionStyle: DatasetCard['actionsStyle']
}>()
const { t } = useI18n()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onIframeMessage = (message: any) => {
  if (message) useAnalytics()?.track(message.trackEvent.action, message.trackEvent)
}

const dialogToggled = (dialog: boolean | undefined) => {
  const title = dialog ? `/datasets/${dataset.slug}/table-dialog` : useRoute().path
  useAnalytics()?.page({ title })
}
</script>

<i18n lang="yaml">
  en:
    preview: Table preview
    previewShort: Preview
  fr:
    preview: Aperçu du tableau
    previewShort: Aperçu
</i18n>
