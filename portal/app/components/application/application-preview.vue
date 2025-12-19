<template>
  <layout-preview
    :title="t('preview') + ' - ' + application.title"
    :action-style="portalConfig.applications.card.actionsStyle"
    :icon="mdiFlipToFront"
    :text="t('preview')"
    :short-text="t('previewShort')"
    :track-path="`/applications/${application.slug}/preview-dialog`"
    :block="block"
  >
    <d-frame-wrapper
      :iframe-title="t('preview') + ' - ' + application.title"
      :src="`${application.exposedUrl}?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
      aspect-ratio
    />
  </layout-preview>
</template>

<script setup lang="ts">
import { mdiFlipToFront } from '@mdi/js'

const { application } = defineProps<{
  application: {
    title: string
    slug: string
    exposedUrl: string
  },
  /** Whether the button should take the full width of its container */
  block?: boolean
}>()
const { t } = useI18n()
const { portalConfig } = usePortalStore()
</script>

<i18n lang="yaml">
  en:
    preview: Application preview
    previewShort: Preview
  fr:
    preview: Aperçu de la visualisation
    previewShort: Aperçu
</i18n>
