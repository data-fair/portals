import type { Ref } from 'vue'
import { useAgentTool } from '@data-fair/lib-vue-agents'
import { useReactiveSearchParams } from '@data-fair/lib-vue/reactive-search-params.js'
import { createAgentTranslator } from './utils'

const messages = {
  fr: { get: 'Lire les filtres de la page', set: 'Modifier les filtres de la page' },
  en: { get: 'Read page filters', set: 'Set page filters' }
}

// keys synced with embedded apps/previews: concept filters (_c…) and per-dataset
// filters (_d_…). We only expose these to the agent, not unrelated router params.
const isFilterKey = (k: string) => k.startsWith('_c') || k.startsWith('_d')

/**
 * Page-scoped agent tools to read and write the filters synced with embedded
 * applications and dataset previews on the current page. Registered once per
 * page (from page-elements.vue at root). Operates on the shared
 * reactiveSearchParams object, which writes through to the vue-router query; the
 * d-frame adapter then propagates changes to the embeds. Each shared-filters
 * block additionally registers a describe_filters_<uuid> tool so the agent
 * learns which keys are valid here.
 */
export function usePageParamsTools (locale: Ref<string>) {
  const t = createAgentTranslator(messages, locale)
  const searchParams = useReactiveSearchParams()

  useAgentTool({
    name: 'pageFilters_get',
    description: 'Read the current page filters synced with embedded visualizations and dataset previews. Returns concept filters (keys starting with "_c") and per-dataset filters (keys starting with "_d_<datasetId>_"). Call a block\'s describe_filters_* tool first to learn which keys it accepts.',
    annotations: { title: t('get'), readOnlyHint: true },
    inputSchema: { type: 'object' as const, properties: {} },
    execute: async () => {
      const current: Record<string, string> = {}
      for (const k of Object.keys(searchParams)) {
        const v = searchParams[k]
        if (isFilterKey(k) && v != null) current[k] = v
      }
      const text = Object.keys(current).length
        ? Object.entries(current).map(([k, v]) => `- \`${k}\` = ${v}`).join('\n')
        : 'No page filters are currently set.'
      return { content: [{ type: 'text' as const, text }], structuredContent: current }
    }
  })

  useAgentTool({
    name: 'pageFilters_set',
    description: 'Set or clear page filters synced with embedded visualizations and dataset previews. Pass a "params" object mapping filter keys to values; an empty string, null, or undefined value clears that key. Use keys advertised by a block\'s describe_filters_* tool (concept keys start with "_c", per-dataset keys with "_d_<datasetId>_").',
    annotations: { title: t('set') },
    inputSchema: {
      type: 'object' as const,
      properties: {
        params: {
          type: 'object' as const,
          description: 'Map of filter key -> value. Empty/null value clears the key.',
          additionalProperties: { type: 'string' as const }
        }
      },
      required: ['params'] as const
    },
    execute: async (args) => {
      const params = (args.params ?? {}) as Record<string, unknown>
      const applied: string[] = []
      for (const [k, v] of Object.entries(params)) {
        if (v === '' || v === null || v === undefined) {
          delete searchParams[k]
          applied.push(`cleared ${k}`)
        } else {
          searchParams[k] = String(v)
          applied.push(`${k} = ${String(v)}`)
        }
      }
      const text = applied.length ? `Applied: ${applied.join(', ')}` : 'No changes.'
      return { content: [{ type: 'text' as const, text }] }
    }
  })
}
