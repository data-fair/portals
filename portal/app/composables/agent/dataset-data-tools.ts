import type { Ref } from 'vue'
import type { $Fetch } from 'ofetch'
import { useAgentTool, useAgentSubAgent } from '@data-fair/lib-vue-agents'
import * as searchData from '@data-fair/agent-tools-data-fair/search-data'
import * as aggregateData from '@data-fair/agent-tools-data-fair/aggregate-data'
import * as calculateMetric from '@data-fair/agent-tools-data-fair/calculate-metric'
import * as getFieldValues from '@data-fair/agent-tools-data-fair/get-field-values'
import * as getDatasetSchema from '@data-fair/agent-tools-data-fair/get-dataset-schema'
import * as datasetDataSubagent from '@data-fair/agent-tools-data-fair/dataset-data-subagent'

const apiBase = '/data-fair/api/v1/'

export function useAgentDatasetDataTools (locale: Ref<string>, localFetch: $Fetch) {
  const localeVal = (locale.value === 'fr' || locale.value === 'en') ? locale.value : 'fr'

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
      const result = searchData.formatResult(data, params)
      return { content: [{ type: 'text' as const, text: result.text }], structuredContent: result.structuredContent }
    }
  })

  useAgentTool({
    ...aggregateData.schema,
    annotations: { ...aggregateData.annotations[localeVal], readOnlyHint: true },
    execute: async (params) => {
      const { path, query } = aggregateData.buildQuery(params)
      const data = await localFetch<any>(apiBase + path, { query })
      const result = aggregateData.formatResult(data, params)
      return { content: [{ type: 'text' as const, text: result.text }], structuredContent: result.structuredContent }
    }
  })

  useAgentTool({
    ...calculateMetric.schema,
    annotations: { ...calculateMetric.annotations[localeVal], readOnlyHint: true },
    execute: async (params) => {
      const { path, query } = calculateMetric.buildQuery(params)
      const data = await localFetch<any>(apiBase + path, { query })
      const result = calculateMetric.formatResult(data, params)
      return { content: [{ type: 'text' as const, text: result.text }], structuredContent: result.structuredContent }
    }
  })

  useAgentTool({
    ...getFieldValues.schema,
    annotations: { ...getFieldValues.annotations[localeVal], readOnlyHint: true },
    execute: async (params) => {
      const { path, query } = getFieldValues.buildQuery(params)
      const values = await localFetch<any>(apiBase + path, { query })
      const result = getFieldValues.formatResult(values, params)
      return { content: [{ type: 'text' as const, text: result.text }], structuredContent: result.structuredContent }
    }
  })

  useAgentSubAgent({
    name: 'dataset_data',
    ...datasetDataSubagent.annotations[localeVal],
    prompt: datasetDataSubagent.prompt,
    tools: [...datasetDataSubagent.tools]
  })
}
