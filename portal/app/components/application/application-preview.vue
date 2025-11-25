<template>
  <layout-preview
    :title="t('preview') + ' - ' + application.title"
    :action-style="portalConfig.applications.card.actionsStyle"
    :icon="mdiFlipToFront"
    :text="t('preview')"
    :short-text="t('previewShort')"
    @update:dialog="dialogToggled"
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
  }
}>()
const { t } = useI18n()
const { portalConfig } = usePortalStore()

const dialogToggled = (dialog: boolean | undefined) => {
  const title = dialog ? `/applications/${application.slug}/preview-dialog` : useRoute().path
  useAnalytics()?.page({ title })
}
</script>

<i18n lang="yaml">
  en:
    preview: Application preview
    previewShort: Preview
  fr:
    preview: Aperçu de la visualisation
    previewShort: Aperçu
</i18n>
