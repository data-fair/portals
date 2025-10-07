<template>
  <d-frame-wrapper
    :iframe-title="`${t('application')} - ${element.application.title}`"
    :src="element.application.exposedUrl + `?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
    :sync-params="element.syncParams ? '*:' + element.application.id + '-app_' : undefined"
    aspect-ratio
  />
</template>

<script setup lang="ts">
import type { Application } from '#api/types/page-config'

const { element } = defineProps<{ element: Application }>()
const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    application: Application
  fr:
    application: Application
</i18n>
