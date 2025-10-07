<template>
  <d-frame-wrapper
    :iframe-title="element.title ? t('iframeTitle', { title: element.title }) : t('iframeNoTitle', { url: element.url })"
    :src="element.url"
    scrolling="no"
    aspect-ratio
  />
</template>

<script setup lang="ts">
import type { IFrame } from '#api/types/page-config'

const { element } = defineProps<{ element: IFrame }>()
const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    iframeNoTitle: 'IFrame link: { url }'
    iframeTitle: 'IFrame - { title }'
  fr:
    iframeNoTitle: "Lien de l'iframe : { url }"
    iframeTitle: "IFrame - { title }"
</i18n>
