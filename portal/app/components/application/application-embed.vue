<template>
  <layout-preview
    :title="t('embed') + ' - ' + application.title"
    :action-style="portalConfig.applications.page.actionsStyle"
    :icon="mdiCodeTags"
    :text="t('embed')"
    :short-text="t('embedShort')"
  >
    <v-card-text class="py-0">
      {{ t('description') }}
      <code class="d-block bg-surface-light my-2 pa-4 v-code">
&lt;iframe src="{{ application.exposedUrl }}?primary={{ $vuetify.theme.current.colors.primary }}" width="100%" height="500px" style="background-color: transparent; border: none;"&gt;&lt;/iframe&gt;
      </code>
    </v-card-text>
    <d-frame-wrapper
      :iframe-title="t('embed') + ' - ' + application.title"
      :src="application.exposedUrl"
      scrolling="no"
      aspect-ratio
    />
  </layout-preview>
</template>

<script setup lang="ts">
import { mdiCodeTags } from '@mdi/js'

const { application } = defineProps<{
  application: {
    id: string
    title: string
    exposedUrl: string
  }
}>()
const { t } = useI18n()
const { portalConfig } = usePortalStore()

</script>

<i18n lang="yaml">
  en:
    embed: Embed in a website
    embedShort: Embed
    description: To embed a preview of this application in a website you can copy the following code or similar code in the HTML source.
  fr:
    embed: Intégrer dans un site
    embedShort: Intégrer
    description: Pour intégrer une prévisualisation de ce jeu de données dans un site vous pouvez copier le code suivant ou un code similaire dans le code source HTML.
</i18n>
