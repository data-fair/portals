<template>
  <layout-preview
    :icon="mdiTableEye"
    :text="t('preview')"
    :short-text="t('previewShort')"
    :title="t('preview') + ' - ' + dataset.title"
  >
    <d-frame-wrapper
      :iframe-title="t('preview') + ' - ' + dataset.title"
      :src="`/data-fair/next-ui/embed/dataset/${dataset.id}/table`"
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

</script>

<i18n lang="yaml">
  en:
    preview: Table preview
    previewShort: Preview
  fr:
    preview: Aperçu du tableau
    previewShort: Aperçu
</i18n>
