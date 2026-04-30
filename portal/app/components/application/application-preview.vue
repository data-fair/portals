<template>
  <layout-preview
    :title="t('title') + ' - ' + application.title"
    :action-style="portalConfig.applications.card.actionsStyle"
    :icon="mdiFlipToFront"
    :resource-title="application.title"
    :text="t('text')"
    :tooltip="t('tooltip')"
    :track-dialog="{ action: 'application-preview', label: application.slug }"
    :block="block"
  >
    <d-frame-wrapper
      :iframe-title="t('title') + ' - ' + application.title"
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
    title: Application preview
    text: Preview
    tooltip: Open the application preview in a dialog
  fr:
    title: Aperçu de la visualisation
    text: Aperçu
    tooltip: Ouvrir l'aperçu de la visualisation dans une boîte de dialogue
</i18n>
