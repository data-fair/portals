import type { Ref } from 'vue'
import type { VBreadcrumbs } from 'vuetify/components'
import type { MenuItem } from '#api/types/portal/index.ts'
import type { LinkItem } from '#api/types/common-links/index.ts'
import type { PortalConfig } from '#api/types/portal-config'
import { useAgentTool } from '@data-fair/lib-vue-agents'
import { useReactiveSearchParams } from '@data-fair/lib-vue/reactive-search-params.js'
import { unwrapFilterQuery } from '@data-fair/agent-tools-data-fair/_utils'
import { createAgentTranslator } from './utils'

type BreadcrumbItems = NonNullable<VBreadcrumbs['$props']['items']>

interface AgentNavigationStore {
  breadcrumbs: Ref<BreadcrumbItems>
  resolveLink: (link: MenuItem | LinkItem) => string | undefined
  resolveLinkTitle: (link: MenuItem | LinkItem, locale: 'fr' | 'en') => string
}

const messages: Record<string, Record<string, string>> = {
  fr: {
    getCurrentLocation: 'Obtenir la localisation actuelle',
    listPages: 'Lister les pages',
    navigateToPage: 'Naviguer vers une page',
    getPageFilters: 'Lire les filtres de la page',
    setPageFilters: 'Modifier les filtres de la page'
  },
  en: {
    getCurrentLocation: 'Get current location',
    listPages: 'List pages',
    navigateToPage: 'Navigate to page',
    getPageFilters: 'Read page filters',
    setPageFilters: 'Set page filters'
  }
}

// keys synced with embedded apps/previews: concept filters (_c…) and per-dataset
// filters (_d_…). We only expose these to the agent, not unrelated router params.
const isFilterKey = (k: string) => k.startsWith('_c') || k.startsWith('_d')

interface AgentNavigationToolsDeps {
  locale: Ref<string>
  portalConfig: PortalConfig
  navigationStore: AgentNavigationStore
}

export function useAgentNavigationTools ({ locale, portalConfig, navigationStore }: AgentNavigationToolsDeps) {
  const t = createAgentTranslator(messages, locale)
  const route = useRoute()
  const router = useRouter()

  useAgentTool({
    name: 'get_current_location',
    description: 'Get the current page location in the portal, including route path, name, parameters, query, and breadcrumbs.',
    annotations: { title: t('getCurrentLocation'), readOnlyHint: true },
    inputSchema: {
      type: 'object' as const,
      properties: {}
    },
    execute: async () => {
      const breadcrumbs = navigationStore.breadcrumbs.value
        .map(b => {
          if (typeof b === 'string') return `- ${b}`
          const title = b.title || ''
          const path = b.to ? (typeof b.to === 'string' ? b.to : router.resolve(b.to).href) : b.href || ''
          return `- ${title}: ${path}`
        })
        .join('\n')
      return {
        content: [{
          type: 'text' as const,
          text: `**Path**: ${route.path}\n**Name**: ${route.name as string}\n**Params**: ${JSON.stringify({ ...route.params })}\n**Query**: ${JSON.stringify({ ...route.query })}\n**Breadcrumbs**:\n${breadcrumbs}`
        }]
      }
    }
  })

  useAgentTool({
    name: 'list_pages',
    description: 'List all available pages in the portal navigation menu, plus detail page patterns for datasets, applications, events, news, and reuses.',
    annotations: { title: t('listPages'), readOnlyHint: true },
    inputSchema: {
      type: 'object' as const,
      properties: {}
    },
    execute: async () => {
      const localeVal = (locale.value === 'fr' || locale.value === 'en') ? locale.value : 'fr'
      const sections: string[] = []

      // Walk menu items recursively
      const formatMenuItems = (items: MenuItem[], indent = ''): string[] => {
        const lines: string[] = []
        for (const item of items) {
          if (item.type === 'submenu') {
            const title = item.title || 'Submenu'
            lines.push(`${indent}- ${title} (submenu):`)
            if (item.children) {
              lines.push(...formatMenuItems(item.children, indent + '  '))
            }
          } else {
            const title = navigationStore.resolveLinkTitle(item, localeVal)
            const path = navigationStore.resolveLink(item)
            if (path && item.type !== 'external') {
              lines.push(`${indent}- ${title}: ${path}`)
            } else if (path && item.type === 'external') {
              lines.push(`${indent}- ${title}: ${path} (external)`)
            }
          }
        }
        return lines
      }

      const menuLines = formatMenuItems(portalConfig.menu.children as MenuItem[])
      if (menuLines.length > 0) {
        sections.push(`**Navigation menu**:\n${menuLines.join('\n')}`)
      }

      sections.push(
        '**Detail pages** (use list_datasets, list_applications, list_events, list_news, or list_reuses to find slugs). The {slug} placeholders below are the human-readable slug returned by those tools; for datasets and applications fall back to the `id` only when no slug exists:\n' +
        '- Dataset detail: /datasets/{slug}\n' +
        '- Dataset table: /datasets/{slug}/table — accepts a filter query string. Use the filterQuery from the dataset_data subagent Context directly as the query parameter; do not build or edit the parameters yourself.\n' +
        '- Dataset map: /datasets/{slug}/map — for geolocalized datasets, accepts the same filterQuery as the table page\n' +
        '- Dataset API doc: /datasets/{slug}/api-doc\n' +
        '- Application detail: /applications/{slug}\n' +
        '- Application full view: /applications/{slug}/full\n' +
        '- Event detail: /event/{slug}\n' +
        '- News detail: /news/{slug}\n' +
        '- Reuse detail: /reuses/{slug}'
      )

      sections.push(
        '**User pages**:\n' +
        '- My account: /me\n' +
        '- My reuses: /me/reuses\n' +
        '- Update dataset: /me/update-dataset\n' +
        '- My processings: /me/processings\n' +
        '- My notifications: /me/notifications'
      )

      return {
        content: [{
          type: 'text' as const,
          text: sections.join('\n\n')
        }]
      }
    }
  })

  useAgentTool({
    name: 'navigate',
    description: 'Navigate to a page in the portal. Use list_pages to discover available paths, and list_datasets, list_applications, list_events, list_news, or list_reuses to find resource slugs/refs — prefer the human-readable `slug` over the `id` when building dataset and application paths. Optionally pass query parameters. IMPORTANT: when you search or filter data from a dataset, offer to navigate the user to the filtered table view at /datasets/{slug}/table by passing the same filter parameters as query params — but only when the search returned results (totalResults > 0).',
    annotations: { title: t('navigateToPage') },
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string' as const,
          description: 'The path to navigate to (e.g. "/datasets", "/datasets/my-dataset", "/event/my-event")'
        },
        query: {
          type: 'string' as const,
          description: 'Optional query string to append to the URL (without leading "?"). For dataset table/map pages, pass the filterQuery from the dataset_data subagent Context verbatim — do not build or edit the filter parameters yourself. You may additionally append `select=<column keys>` to choose which columns are displayed, but do not otherwise alter the filter syntax.'
        }
      },
      required: ['path'] as const
    },
    execute: async (params) => {
      try {
        // Defensive unwrap: the agent is told to pass the dataset_data subagent's filterQuery
        // value directly, but it sometimes wraps it as "filterQuery=<the whole query string>".
        const queryString = unwrapFilterQuery(params.query as string | undefined)
        const query = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : undefined
        await router.push(query ? { path: params.path, query } : params.path)
        await new Promise(resolve => setTimeout(resolve, 500))
        const currentRoute = router.currentRoute.value
        return {
          content: [{
            type: 'text' as const,
            text: `**Success**: true\n**New Path**: ${currentRoute.path}\n**Query**: ${JSON.stringify({ ...currentRoute.query })}`
          }]
        }
      } catch (error: any) {
        return {
          content: [{
            type: 'text' as const,
            text: `**Success**: false\n**Error**: ${error.message}`
          }],
          isError: true
        }
      }
    }
  })

  // Page filter tools — global because the reactive search params object is
  // shared across all pages. Per-block describe_filters_* tools (page-scoped)
  // tell the agent which keys each block accepts.
  const searchParams = useReactiveSearchParams()

  useAgentTool({
    name: 'pageFilters_get',
    description: 'Read the current page filters synced with embedded visualizations and dataset previews. Returns concept filters (keys starting with "_c") and per-dataset filters (keys starting with "_d_<datasetId>_"). Call a block\'s describe_filters_* tool first to learn which keys it accepts.',
    annotations: { title: t('getPageFilters'), readOnlyHint: true },
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
    annotations: { title: t('setPageFilters') },
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
