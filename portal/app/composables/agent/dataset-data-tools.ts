import type { Ref } from 'vue'
import { useAgentTool, useAgentSubAgent } from '@data-fair/lib-vue-agents'
import * as searchData from '@data-fair/agent-tools-data-fair/search-data.ts'
import * as aggregateData from '@data-fair/agent-tools-data-fair/aggregate-data.ts'
import * as calculateMetric from '@data-fair/agent-tools-data-fair/calculate-metric.ts'
import * as getFieldValues from '@data-fair/agent-tools-data-fair/get-field-values.ts'
import * as getDatasetSchema from '@data-fair/agent-tools-data-fair/get-dataset-schema.ts'
import * as datasetDataSubagent from '@data-fair/agent-tools-data-fair/dataset-data-subagent.ts'

const apiBase = '/data-fair/api/v1/'

export function useAgentDatasetDataTools (locale: Ref<string>) {
  const localFetch = useNuxtApp().$localFetch
  const localeVal = locale.value as 'fr' | 'en'

  useAgentTool({
    ...getDatasetSchema.schema,
    annotations: { ...getDatasetSchema.annotations[localeVal], readOnlyHint: true },
    execute: async (params) => {
      const { schemaReq, samplesReq } = getDatasetSchema.buildQuery(params)
      const [dataset, linesData] = await Promise.all([
        localFetch<any>(apiBase + schemaReq.path, { query: schemaReq.query }),
        localFetch<any>(apiBase + samplesReq.path, { query: samplesReq.query })
      ])
      return getDatasetSchema.formatResult(dataset, linesData)
    }
  })

  useAgentTool({
    ...searchData.schema,
    annotations: { ...searchData.annotations[localeVal], readOnlyHint: true },
    execute: async (params) => {
      let data: any
      if (params.next) {
        const url = new URL(params.next)
        data = await localFetch<any>(url.pathname + url.search)
      } else {
        const { path, query } = searchData.buildQuery(params)
        data = await localFetch<any>(apiBase + path, { query })
      }
      return searchData.formatResult(data, params)
    }
  })

  useAgentTool({
    ...aggregateData.schema,
    annotations: { ...aggregateData.annotations[localeVal], readOnlyHint: true },
    execute: async (params) => {
      const { path, query } = aggregateData.buildQuery(params)
      const data = await localFetch<any>(apiBase + path, { query })
      return aggregateData.formatResult(data, params.metric)
    }
  })

  useAgentTool({
    ...calculateMetric.schema,
    annotations: { ...calculateMetric.annotations[localeVal], readOnlyHint: true },
    execute: async (params) => {
      const { path, query } = calculateMetric.buildQuery(params)
      const data = await localFetch<any>(apiBase + path, { query })
      return calculateMetric.formatResult(data, params)
    }
  })

  useAgentTool({
    ...getFieldValues.schema,
    annotations: { ...getFieldValues.annotations[localeVal], readOnlyHint: true },
    execute: async (params) => {
      const { path, query } = getFieldValues.buildQuery(params)
      const values = await localFetch<any>(apiBase + path, { query })
      return getFieldValues.formatResult(values, params.fieldKey)
    }
  })

  useAgentSubAgent({
    name: 'dataset_data',
    ...datasetDataSubagent.annotations[localeVal],
    prompt: datasetDataSubagent.prompt,
    tools: [...datasetDataSubagent.tools]
  })
}
