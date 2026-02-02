<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="portalConfig.datasets.page.metadata?.actionsStyle"
    :icon="mdiDownload"
    :resource-title="dataset.title"
    :text="t('preview')"
    :short-text="t('previewShort')"
    :track-path="`/datasets/${dataset.slug}/download-dialog`"
  >
    <!-- direct links to files-->
    <v-list-item
      v-for="(file, i) of files"
      :key="i"
      :title="file.title"
    >
      <v-list-item-subtitle v-if="file.key === 'normalized' || file.key.startsWith('export-')">
        {{ t('formatSubtitle.' + file.format) }}
      </v-list-item-subtitle>
      <v-list-item-subtitle v-else>
        {{ file.name }} ({{ formatBytes(file.size) }})
      </v-list-item-subtitle>
      <template #append>
        <v-btn
          :title="file.title"
          :icon="mdiDownload"
          :href="file.url"
          variant="text"
          @click="clickDownload(file.format)"
        />
      </template>
    </v-list-item>

    <!-- download of formats exported by API when <= 10000 lines -->
    <v-list-item
      v-for="format in simpleExports"
      :key="format"
      :title="t('export', { format: format.toUpperCase()})"
      :subtitle="t('formatSubtitle.' + format)"
    >
      <template #append>
        <v-btn
          :title="t('export', { format: format.toUpperCase() })"
          :icon="mdiDownload"
          :href="`/data-fair/api/v1/datasets/${dataset.id}/lines?size=10000&page=1&format=${format}`"
          variant="text"
          @click="clickDownload(format)"
        />
      </template>
    </v-list-item>

    <!-- link to table vue for filtered exports -->
    <template v-if="count > 10000">
      <v-list-item
        :title="t('dataTooLargeAlertTitle')"
        :subtitle="t('dataTooLargeAlertText', { formats: new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(['CSV', 'XLSX', 'ODS', ...(dataset.bbox ? ['GEOJSON'] : [])]) })"
        base-color="info"
      >
        <template #append>
          <v-btn
            :to="`/datasets/${dataset.slug}/table`"
            :title="t('table')"
            :icon="mdiTableLarge"
            variant="text"
          />
        </template>
      </v-list-item>
    </template>
  </layout-preview>
</template>

<script setup lang="ts">
import type { Dataset } from '#api/types/index.ts'
import { mdiDownload, mdiTableLarge } from '@mdi/js'
import formatBytes from '@data-fair/lib-vue/format/bytes.js'

type File = {
  name: string
  key: 'original' | string
  title: string
  mimetype: string
  size: number
  url: string
  format: string
}

const { dataset } = defineProps<{ dataset: Dataset }>()
const { t, locale } = useI18n()
const { portalConfig } = usePortalStore()

const files = ref<File[]>([])
const countFetch = useLocalFetch<{ total: number }>(`/data-fair/api/v1/datasets/${dataset.id}/lines`, { params: { size: 0 } })
const count = computed(() => countFetch.data.value?.total || 0)

const hasNormalizedCSV = computed(() => files.value.some(f => (['normalized', 'full'].includes(f.key) && f.mimetype === 'text/csv') || f.key === 'export-csv'))

const simpleExports = computed(() => {
  if (count.value > 10000) return []
  const exportsList = []
  if (!hasNormalizedCSV.value) exportsList.push('csv')
  exportsList.push('xlsx')
  exportsList.push('ods')
  const hasNormalizedGeojson = files.value.some(f => (['normalized', 'full'].includes(f.key) && f.mimetype === 'application/geo+json') || f.key === 'export-geojson')
  if (!hasNormalizedGeojson && dataset.bbox?.length) exportsList.push('geojson')
  return exportsList
})

let filesRes: File[] = []
if (!dataset.isVirtual && !dataset.isRest && !dataset.isMetaOnly) {
  filesRes = (await useLocalFetch<File[]>(`/data-fair/api/v1/datasets/${dataset.id}/data-files`)).data.value || []
}

if (dataset.virtual?.children) {
  const childrenFetch = await useLocalFetch<{ results: Dataset[] }>('/data-fair/api/v1/datasets', {
    params: {
      id: dataset.virtual.children.join(','),
      select: 'id,isVirtual,isRest,isMetaOnly'
    }
  })
  for (const child of childrenFetch.data.value?.results || []) {
    if (!child.userPermissions.includes('listDataFiles')) continue
    if (child.isVirtual || child.isRest || child.isMetaOnly) continue
    const childrenFiles: File[] = (await useLocalFetch<File[]>(`/data-fair/api/v1/datasets/${child.id}/data-files`)).data.value || []
    const file = childrenFiles?.find(f => f.key === 'original')
    if (file) filesRes.push(file)
  }
}

// Add format
files.value = filesRes.map(f => ({
  ...f,
  format: f.mimetype ? f.mimetype.split('/').pop()?.replace('+', '') || '' : f.name.split('.').pop() || ''
}))

const clickDownload = (format: string) => {
  useAnalytics()?.track('download', { label: `${dataset.slug} - ${format}` })
}

</script>

<i18n lang="yaml">
  en:
    dataTooLargeAlertTitle: This dataset contains more than 10,000 rows.
    dataTooLargeAlertText: "Export in the { formats } formats is only possible from the table view"
    export: Export { format }
    formatSubtitle:
      csv: Text format for all spreadsheet software (separator ",")
      xlsx: Format suitable for Excel
      ods: Format suitable for Libre Office and other free spreadsheet software
      geojson: Portable format for geographic data
    preview: Data download
    previewShort: Download
    table: Open table view
  fr:

    dataTooLargeAlertTitle: Ce jeu de données contient plus de 10 000 lignes.
    dataTooLargeAlertText: "L'export dans les formats { formats } n'est possible qu'à partir de la vue tableau."
    export: Export { format }
    formatSubtitle:
      csv: Format textuel pour tous logiciels tableurs (séparateur ",")
      xlsx: Format adapté pour Excel
      ods: Format adapté pour Libre Office et autres logiciels tableurs libres
      geojson: Format portable pour données géographiques
    preview: Téléchargement des données
    previewShort: Télécharger
    table: Ouvrir la vue tableau
</i18n>
