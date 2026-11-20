<template>
  <action-btn
    v-if="shouldShowActionButton('table')"
    :to="{
      path: `/datasets/${dataset.slug}/table`,
      query: $route.query
    }"
    :action-style="metadataConfig.actionsStyle"
    :icon="mdiTableLarge"
    :resource-title="dataset.title"
    :text="t('text.table')"
    :tooltip="t('tooltip.table')"
  />
  <action-btn
    v-if="dataset.bbox?.length && shouldShowActionButton('map')"
    :to="`/datasets/${dataset.slug}/map`"
    :action-style="metadataConfig.actionsStyle"
    :icon="mdiMapMarker"
    :resource-title="dataset.title"
    :text="t('text.map')"
    :tooltip="t('tooltip.map')"
  />
  <action-btn
    v-if="!$vuetify.display.smAndDown && shouldShowActionButton('api')"
    :to="`/datasets/${dataset.slug}/api-doc`"
    :action-style="metadataConfig.actionsStyle"
    :icon="mdiCog"
    :resource-title="dataset.title"
    :text="t('text.api')"
    :tooltip="t('tooltip.api')"
  />

  <dataset-download
    v-if="shouldShowActionButton('download')"
    :dataset="dataset"
  />
  <dataset-schema
    v-if="shouldShowActionButton('schema')"
    :dataset="dataset"
  />
  <dataset-embed
    v-if="!$vuetify.display.smAndDown && shouldShowActionButton('embed') && dataset.previews?.length"
    :dataset="dataset"
  />
</template>

<script setup lang="ts">
import type { Dataset } from '#api/types/index.ts'
import type { ActionButtons } from '#api/types/portal-config'
import { mdiCog, mdiMapMarker, mdiTableLarge } from '@mdi/js'

const { dataset } = defineProps<{ dataset: Dataset }>()
const { portalConfig } = usePortalStore()
const { t } = useI18n()

const metadataConfig = computed(() => portalConfig.value.datasets.page.metadata || {})
const shouldShowActionButton = (button: ActionButtons[number]) => metadataConfig.value.actionButtons?.includes(button)
</script>

<i18n lang="yaml">
  en:
    text:
      api: API
      map: Map
      table: Table
    tooltip:
      map: Open the map view in full page
      table: Open the table view in full page
      api: Open the API documentation in full page
  fr:
    text:
      api: API
      map: Carte
      table: Tableau
    tooltip:
      map: Ouvrir la vue carte en pleine page
      table: Ouvrir la vue tableau en pleine page
      api: Ouvrir la documentation d'API en pleine page
</i18n>
