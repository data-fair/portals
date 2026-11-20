import type { Dataset } from '#api/types/index.ts'

// Parent of a fragment dataset (a table of a meta-only dataset): the breadcrumbs of its sub-pages hang on it
export function useParentDataset (partOf: Dataset['partOf']) {
  const parentFetch = partOf?.type === 'dataset'
    ? useLocalFetch<Pick<Dataset, 'slug' | 'title'>>('/data-fair/api/v1/datasets/' + partOf.id)
    : null
  return computed(() => parentFetch?.data.value)
}
