import type { Dataset } from '#api/types/index.ts'

// Parent of a fragment dataset (a table of a meta-only dataset): its pages lead back to it
export function useParentDataset (partOf: Dataset['partOf']) {
  const parentFetch = partOf?.type === 'dataset'
    ? useLocalFetch<Pick<Dataset, 'slug' | 'title'>>('/data-fair/api/v1/datasets/' + partOf.id)
    : null
  return computed(() => parentFetch?.data.value)
}
