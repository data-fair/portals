<template>
  <layout-preview
    :title="t('embed') + ' - ' + application.title"
    :action-style="portalConfig.datasets.page.metadata?.actionsStyle"
    :icon="mdiCodeTags"
    :text="t('embed')"
    :short-text="t('embedShort')"
    :track-path="`/applications/${application.slug}/embed-dialog`"
  >
    <v-card-text class="py-0">
      {{ t('description') }}
      <v-code class="d-block my-2 pa-4">
        &lt;iframe src="{{ stateUrl.replace('d-frame=true', '') }}" width="100%"
        height="500px" style="background-color: transparent; border: none;"&gt;&lt;/iframe&gt;
      </v-code>
    </v-card-text>
    <d-frame-wrapper
      :iframe-title="t('embed') + ' - ' + application.title"
      :src="application.exposedUrl + '?d-frame=true&primary=' + $vuetify.theme.current.colors.primary"
      scrolling="no"
      resize="no"
      aspect-ratio
      state-change-events
      @state-change="storeState"
    />
  </layout-preview>
</template>

<script setup lang="ts">
import { mdiCodeTags } from '@mdi/js'

const { application } = defineProps<{
  application: {
    id: string
    slug: string
    title: string
    exposedUrl: string
  }
}>()

const { t } = useI18n()
const { portalConfig } = usePortalStore()

const stateUrl = ref(application.exposedUrl)
const storeState = (state: { detail: [string, string] }) => {
  stateUrl.value = state.detail[1]
}

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
