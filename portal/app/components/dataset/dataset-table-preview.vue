<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="portalConfig.datasets.actionsStyle"
    :icon="mdiTableEye"
    :text="t('preview')"
    :short-text="t('previewShort')"
  >
    <d-frame-wrapper
      :iframe-title="t('preview') + ' - ' + dataset.title"
      :src="`/data-fair/next-ui/embed/dataset/${dataset.id}/table`"
      scrolling="no"
      aspect-ratio
    />
  </layout-preview>
</template>

<script setup lang="ts">
import { mdiTableEye } from '@mdi/js'

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
    preview: Table preview
    previewShort: Preview
  fr:
    preview: Aperçu du tableau
    previewShort: Aperçu
</i18n>
