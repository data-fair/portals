import type { UseFetchOptions } from 'nuxt/app'
import type { Dataset } from '#api/types/index.ts'

export type DatasetFile = {
  name: string
  key: 'original' | string
  title: string
  mimetype: string
  size: number
  url: string
  format: string
}

export type SimpleExport = { key: string, format: string }

// the download panel and the Dataset JSON-LD must expose exactly the same list
export const useDatasetFiles = async (dataset: Dataset) => {
  const nuxtApp = useNuxtApp()
  // the nuxt instance is lost after the first await of this composable: every chained call gets it back.
  // the count fetch below stays direct, it runs before any await and must not be awaited
  const fetchInContext = <T>(url: string, options?: UseFetchOptions<T>) =>
    nuxtApp.runWithContext(() => useLocalFetch<T>(url, options))

  const countFetch = useLocalFetch<{ total: number }>(`/data-fair/api/v1/datasets/${dataset.id}/lines`, { params: { size: 0 } })
  const count = computed(() => countFetch.data.value?.total || 0)

  let filesRes: Omit<DatasetFile, 'format'>[] = []
  if (!dataset.isVirtual && !dataset.isRest && !dataset.isMetaOnly) {
    filesRes = (await fetchInContext<Omit<DatasetFile, 'format'>[]>(`/data-fair/api/v1/datasets/${dataset.id}/data-files`)).data.value || []
  }

  if (dataset.virtual?.children) {
    const childrenFetch = await fetchInContext<{ results: Dataset[] }>('/data-fair/api/v1/catalog/datasets', {
      params: {
        id: dataset.virtual.children.join(','),
        select: 'id,isVirtual,isRest,isMetaOnly'
      }
    })
    for (const child of childrenFetch.data.value?.results || []) {
      if (!child.userPermissions.includes('listDataFiles')) continue
      if (child.isVirtual || child.isRest || child.isMetaOnly) continue
      const childrenFiles = (await fetchInContext<Omit<DatasetFile, 'format'>[]>(`/data-fair/api/v1/datasets/${child.id}/data-files`)).data.value || []
      const file = childrenFiles.find(f => f.key === 'original')
      if (file) filesRes.push(file)
    }
  }

  const files: DatasetFile[] = filesRes.map(f => ({
    ...f,
    format: f.mimetype ? f.mimetype.split('/').pop()?.replace('+', '') || '' : f.name.split('.').pop() || ''
  }))

  const hasNormalizedCSV = files.some(f => (['normalized', 'full'].includes(f.key) && f.mimetype === 'text/csv') || f.key === 'export-csv')
  const hasNormalizedGeojson = files.some(f => (['normalized', 'full'].includes(f.key) && f.mimetype === 'application/geo+json') || f.key === 'export-geojson')

  const simpleExports = computed<SimpleExport[]>(() => {
    if (count.value > 10000) return []
    const exportsList: SimpleExport[] = []
    if (!hasNormalizedCSV) exportsList.push({ key: 'csv', format: 'csv' })
    exportsList.push({ key: 'xlsx', format: 'xlsx' })
    exportsList.push({ key: 'ods', format: 'ods' })
    if (dataset.bbox?.length) {
      if (!hasNormalizedGeojson) exportsList.push({ key: 'geojson', format: 'geojson' })
      exportsList.push({ key: 'shapefile', format: 'shp' })
    }
    return exportsList
  })

  return { files, simpleExports, count }
}
