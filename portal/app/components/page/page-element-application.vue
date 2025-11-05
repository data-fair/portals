<template>
  <d-frame-wrapper
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :iframe-title="`${t('application')} - ${element.application.title}`"
    :src="element.application.slug + `?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
    :sync-params="element.syncParams ? '*:' + element.application.id + '-app_' : undefined"
    aspect-ratio
  />
</template>

<script setup lang="ts">
import type { ApplicationElement } from '#api/types/page-config'

const { element } = defineProps<{ element: ApplicationElement }>()
const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    application: Application
  fr:
    application: Application
</i18n>
