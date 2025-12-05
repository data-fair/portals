<template>
  <action-btn
    :action-style="portalConfig.datasets.page.metadata?.actionsStyle"
    :icon="mdiCamera"
    :text="t('text.capture')"
    :short-text="t('shortText.capture')"
    @click="handleCapture"
  />
</template>

<script setup lang="ts">
import { mdiCamera } from '@mdi/js'
import { withQuery } from 'ufo'
import { useTheme } from 'vuetify'

const { application } = defineProps<{
  application: {
    id: string
    href: string
    updatedAt: string
    baseApplication?: {
      meta?: {
        'df:capture-width'?: string
        'df:capture-height'?: string
      }
    }
  }
}>()

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const route = useRoute()
const theme = useTheme()

const handleCapture = () => {
  const params: Record<string, string> = {
    width: application.baseApplication?.meta?.['df:capture-width'] || '1280',
    height: application.baseApplication?.meta?.['df:capture-height'] || '720',
    updatedAt: application.updatedAt,
    app_primary: theme.current.value.colors.primary
  }

  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string') {
      params[`app_${key}`] = value
    }
  }

  const captureUrl = withQuery(`${application.href}/capture`, params)
  window.open(captureUrl, '_blank')
}
</script>

<i18n lang="yaml">
  en:
    text:
      capture: Capture application
    shortText:
      capture: Capture
  fr:
    text:
      capture: Capturer la visualisation
    shortText:
      capture: Capturer
</i18n>
