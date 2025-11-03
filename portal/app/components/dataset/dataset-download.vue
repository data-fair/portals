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
        {{ $t('formatSubtitles.' + file.format) }}
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

    <!-- download of large CSV in 10000 lines chunks -->
    <!--
    <template v-if="count > 10000 && !hasNormalizedCSV">
      <v-list-item
        :title="t('export', { format: 'CSV' })"
        :subtitle="t('formatSubtitle.csv')"
      >
        <template #append>
          <v-btn
            v-if="!largeCsvLoading"
            :icon="mdiDownload"
            :title="t('export', { format: 'CSV' })"
            variant="text"
            @click="downloadLargeCSV"
          />
          <v-btn
            v-else
            :icon="mdiClose"
            :title="t('cancelDownload')"
            variant="text"
            color="warning"
            @click="cancelLargeCsv"
          />
        </template>
      </v-list-item>
      <div style="height:4px;width:100%;">
        <v-progress-linear
          v-if="largeCsvLoading"
          :buffer-value="largeCsvBufferValue"
          :value="largeCsvValue"
          stream
          height="4"
          style="margin:0;"
        />
      </div>
    </template>
    -->

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
        tile
      >
        {{ t('dataTooLargeAlert1') }}<br>
        {{ t('dataTooLargeAlert2') }}
      </v-alert>
      <v-list-item :title="`Export filtré aux formats ${join(['XLSX', 'ODS', ...(dataset.bbox ? ['GEOJSON'] : [])])}`">
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
  if (count.value > 10000 || !files.value.length) return []
  const exportsList = []
  const hasNormalizedGeojson = files.value.some(f => (['normalized', 'full'].includes(f.key) && f.mimetype === 'application/geo+json') || f.key === 'export-geojson')
  if (!hasNormalizedCSV.value) exportsList.push('csv')
  exportsList.push('xlsx')
  exportsList.push('ods')
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

/* TODO: Voir avec Alban
const largeCsvLoading = ref(false)
const largeCsvBufferValue = ref(0)
const largeCsvValue = ref(0)
const largeCsvCancelled = ref(false)
const largeCsvWriter = ref<WritableStreamDefaultWriter | null>(null)
const largeCsvFileStream = ref<WritableStream | null>(null)

const downloadLargeCSV = async () => {
  largeCsvCancelled.value = false
  largeCsvLoading.value = true
  try {
    const { WritableStream } = await import('web-streams-polyfill/ponyfill')
    const { default: streamSaver } = await import('streamsaver')
    // @ts-expect-error - Type compatibility issue with web-streams-polyfill
    streamSaver.WritableStream = WritableStream
    streamSaver.mitm = `${window.location.origin}/streamsaver/mitm.html`

    const fileStream = streamSaver.createWriteStream(`${dataset.slug}.csv`)
    largeCsvFileStream.value = fileStream
    const writer = fileStream.getWriter()
    largeCsvWriter.value = writer

    const nbChunks = Math.ceil(count.value / 10000)
    let nextUrl = `/data-fair/api/v1/datasets/${dataset.id}/lines?size=10000&page=1&format=csv&header=true`

    for (let chunk = 0; chunk < nbChunks; chunk++) {
      if (largeCsvCancelled.value) break
      largeCsvBufferValue.value = ((chunk + 1) / nbChunks) * 100

      let response: Awaited<ReturnType<typeof useLocalFetch<string>>>
      try {
        response = await useLocalFetch<string>(nextUrl)
      } catch {
        // 1 retry after 10s for network resilience, short service interruption, etc
        await new Promise(resolve => setTimeout(resolve, 10000))
        response = await useLocalFetch<string>(nextUrl)
      }
      if (!response.data.value) throw new Error('No data received')
      const csvData = response.data.value

      // For subsequent chunks, remove header and increment page
      if (chunk > 0) {
        const url = new URL(nextUrl)
        const currentPage = parseInt(url.searchParams.get('page') || '1')
        url.searchParams.set('page', String(currentPage + 1))
        url.searchParams.set('header', 'false')
        nextUrl = url.href
      } else {
        // For first chunk, prepare next URL for subsequent chunks
        const url = new URL(nextUrl)
        url.searchParams.set('page', '2')
        url.searchParams.set('header', 'false')
        nextUrl = url.href
      }
      await writer.write(new TextEncoder().encode(csvData))
      largeCsvValue.value = ((chunk + 1) / nbChunks) * 100
    }
    if (!largeCsvCancelled.value) writer.close()
  } catch (error) {
    if (!largeCsvCancelled.value && !!error) {
      console.log('download large csv error', error)
      // TODO: send ui notif error
    }
  }
  largeCsvLoading.value = false
  largeCsvCancelled.value = false
  largeCsvBufferValue.value = 0
  largeCsvValue.value = 0
  largeCsvWriter.value = null
  largeCsvFileStream.value = null
}

const cancelLargeCsv = async () => {
  largeCsvCancelled.value = true

  // Properly close writer and stream
  if (largeCsvWriter.value) {
    largeCsvWriter.value.releaseLock()
    largeCsvWriter.value = null
  }
  if (largeCsvFileStream.value) {
    await largeCsvFileStream.value.abort()
    largeCsvFileStream.value = null
  }

  // Reset progress values
  largeCsvLoading.value = false
  largeCsvBufferValue.value = 0
  largeCsvValue.value = 0
}
*/
</script>

<i18n lang="yaml">
  en:
    preview: Data download
    previewShort: Download
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
    dataTooLargeAlert1: Ce jeu de données contient plus de 10 000 lignes.
    dataTooLargeAlert2: Un export dans les formats ci-dessous n'est possible qu'en filtrant des éléments à partir de la vue tableau.
</i18n>
