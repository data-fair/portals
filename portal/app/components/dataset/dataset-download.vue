<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="actionStyle"
    :icon="mdiDownload"
    :text="t('preview')"
    :short-text="t('previewShort')"
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
        {{ file.name }} ({{ file.size }})
      </v-list-item-subtitle>
      <template #append>
        <v-btn
          :title="file.title"
          :icon="mdiDownload"
          :href="file.url"
          variant="text"
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
        />
      </template>
    </v-list-item>

    <!-- link to table vue for filtered exports -->
    <template v-if="count > 10000">
      <v-alert
        color="warning"
        class="mx-4"
        :title="t('dataTooLargeAlertTitle')"
        :text="t('dataTooLargeAlertText')"
      />
      <v-list-item :title="`Export filtré aux formats ${join(['CSV', 'XLSX', 'ODS', ...(dataset.bbox ? ['GEOJSON'] : [])])}`">
        <template #append>
          <v-btn
            :to="`/datasets/${dataset.slug}/full`"
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
import type { DatasetCard } from '#api/types/portal/index.js'
import { mdiDownload, mdiTableLarge } from '@mdi/js'

type Dataset = {
  id: string
  slug: string
  title: string
  isMetaOnly: boolean
  isRest: boolean
  isVirtual: boolean
  virtual?: {
    children?: string[]
  }
  bbox?: number[]
  userPermissions: string[]
}
type File = {
  name: string
  key: 'original' | string
  title: string
  mimetype: string
  size: number
  url: string
  format: string
}

const { dataset } = defineProps<{
  dataset: Dataset
  actionStyle: DatasetCard['actionsStyle']
}>()
const { t } = useI18n()

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

onMounted(async () => {
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
})

const join = (array?: string[]): string => {
  if (!array || array.length === 0) return ''
  if (array.length === 1) return array[0] || ''
  if (array.length === 2) return `${array[0] || ''} ${t('or')} ${array[1] || ''}`
  return `${array.slice(0, -1).map(s => s || '').join(', ')} ${t('or')} ${array[array.length - 1] || ''}`
}

</script>

<i18n lang="yaml">
  en:
    preview: Data download
    previewShort: Download
    export: Export { format }
    formatSubtitle:
      csv: Text format for all spreadsheet software (separator ",")
      xlsx: Format suitable for Excel
      ods: Format suitable for Libre Office and other free spreadsheet software
      geojson: Portable format for geographic data
    dataTooLargeAlertTitle: This dataset contains more than 10,000 rows.
    dataTooLargeAlertText: Export in the following formats is only possible from the table view
  fr:
    or: ou
    preview: Téléchargement des données
    previewShort: Télécharger
    export: Export { format }
    formatSubtitle:
      csv: Format textuel pour tous logiciels tableurs (séparateur ",")
      xlsx: Format adapté pour Excel
      ods: Format adapté pour Libre Office et autres logiciels tableurs libres
      geojson: Format portable pour données géographiques
    dataTooLargeAlertTitle: Ce jeu de données contient plus de 10 000 lignes.
    dataTooLargeAlertText: L'export dans les formats suivants n'est possible qu'à partir de la vue tableau.
</i18n>
