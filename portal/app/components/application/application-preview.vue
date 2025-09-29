<template>
  <layout-preview
    :icon="mdiImageSizeSelectLarge"
    :text="t('preview')"
    :short-text="t('previewShort')"
    :title="t('preview') + ' - ' + application.title"
  >
    <d-frame-wrapper
      :iframe-title="t('preview') + ' - ' + application.title"
      :src="`${application.exposedUrl}?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
      aspect-ratio
    />
  </layout-preview>
</template>

<script setup lang="ts">
import { mdiImageSizeSelectLarge } from '@mdi/js'

const { application } = defineProps<{
  application: {
    title: string
    exposedUrl: string
  }
}>()
const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    preview: Application preview
    previewShort: Preview
  fr:
    preview: Aperçu de la visualisation
    previewShort: Aperçu
</i18n>
