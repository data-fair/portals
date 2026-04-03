import type { Ref } from 'vue'
import { useAgentTool } from '@data-fair/lib-vue-agents'
import * as listDatasets from '@data-fair/agent-tools-data-fair/list-datasets.ts'
import * as describeDataset from '@data-fair/agent-tools-data-fair/describe-dataset.ts'

export { formatResult as serializeDatasetInfo } from '@data-fair/agent-tools-data-fair/describe-dataset.ts'

export function useAgentDatasetTools (locale: Ref<string>) {
  const localFetch = useNuxtApp().$localFetch
  const localeVal = locale.value as 'fr' | 'en'

  useAgentTool({
    ...listDatasets.schema,
    annotations: { ...listDatasets.annotations[localeVal], readOnlyHint: true },
    execute: async (params) => {
      const { path, query } = listDatasets.buildQuery(params, true)
      const data = await localFetch<any>(`/data-fair/api/v1/${path}`, { query })
      const page = Math.max(params.page || 1, 1)
      const size = Math.min(Math.max(params.size || 10, 1), 50)
      return listDatasets.formatResult(data, page, size)
    }
  })

  useAgentTool({
    ...describeDataset.schema,
    annotations: { ...describeDataset.annotations[localeVal], readOnlyHint: true },
    execute: async (params) => {
      const dataset = await localFetch<any>(`/data-fair/api/v1/datasets/${encodeURIComponent(params.datasetId)}`)
      return describeDataset.formatResult(dataset)
    }
  })
}
