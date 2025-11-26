<template>
  <layout-preview
    :title="t('embed') + ' - ' + dataset.title"
    :action-style="portalConfig.applications.page.actionsStyle"
    :icon="mdiCodeTags"
    :text="t('embed')"
    :short-text="t('embedShort')"
    :track-path="`/datasets/${dataset.slug}/embed-dialog`"
  >
    <v-card-text class="py-0">
      <v-row>
        <v-col
          cols="12"
          md="8"
        >
          {{ t('description') }}
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-select
            v-if="dataset.previews && dataset.previews.length > 1"
            v-model="selectedPreview"
            :items="previewItems"
            item-value="href"
            :label="t('previewType')"
            hide-details
          />
        </v-col>
      </v-row>
      <v-code class="d-block my-2 pa-4">
        &lt;iframe src="{{ stateUrl }}" width="100%" height="500px" style="background-color: transparent; border:
        none;"&gt;&lt;/iframe&gt;
      </v-code>
    </v-card-text>
    <d-frame-wrapper
      :iframe-title="t('embed') + ' - ' + dataset.title"
      :src="selectedPreview"
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

const { dataset } = defineProps<{
  dataset: {
    id: string
    slug: string
    title: string
    previews: {
      id: string
      title: string
      href: string
    }[]
  }
}>()
const { t } = useI18n()
const { portalConfig } = usePortalStore()

const previewItems = dataset.previews.map(preview => {
  let title = preview.title
  if (preview.id === 'table') title = t('preview.table')
  else if (preview.id === 'map') title = t('preview.map')
  else if (preview.id === 'map-bounds') title = t('preview.mapBounds')
  return { ...preview, title }
})

const selectedPreview = ref<string | undefined>(previewItems[0]?.href)
const stateUrl = ref(previewItems[0]?.href)
const storeState = (state: { detail: [string, string] }) => {
  stateUrl.value = state.detail[1]
}
</script>

<i18n lang="yaml">
  en:
    embed: Embed in a website
    embedShort: Embed
    description: To embed a preview of this dataset in a website you can copy the following code or similar code in the HTML source.
    previewType: Preview type
    result: Result
    preview:
      table: Table
      map: Map
      mapBounds: Geographic envelope
  fr:
    embed: Intégrer dans un site
    embedShort: Intégrer
    description: Pour intégrer une prévisualisation de ce jeu de données dans un site vous pouvez copier le code suivant ou un code similaire dans le code source HTML.
    previewType: Type de prévisualisation
    result: Résultat
    preview:
      table: Tableau
      map: Carte
      mapBounds: Enveloppe géographique
</i18n>
