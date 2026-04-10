import type { Ref } from 'vue'
import type { VBreadcrumbs } from 'vuetify/components'
import type { MenuItem } from '#api/types/portal/index.ts'
import type { LinkItem } from '#api/types/common-links/index.ts'
import type { PortalConfig } from '#api/types/portal-config'
import { useAgentTool } from '@data-fair/lib-vue-agents'
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
    navigateToPage: 'Naviguer vers une page'
  },
  en: {
    getCurrentLocation: 'Get current location',
    listPages: 'List pages',
    navigateToPage: 'Navigate to page'
  }
}

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
        '**Detail pages** (use list_datasets, list_applications, list_events, list_news, or list_reuses to find slugs/refs):\n' +
        '- Dataset detail: /datasets/{ref}\n' +
        '- Dataset table: /datasets/{ref}/table — accepts filter query params (same format as search_data filters: column_key + suffix like nom_search, age_lte, ville_eq). Also accepts q (full-text search), sort, select, bbox, geo_distance, date_match. Use the filterQuery from dataset_data subagent Context directly as the query parameter.\n' +
        '- Dataset map: /datasets/{ref}/map — for geolocalized datasets, accepts the same filter query params as the table page\n' +
        '- Dataset API doc: /datasets/{ref}/api-doc\n' +
        '- Application detail: /applications/{ref}\n' +
        '- Application full view: /applications/{ref}/full\n' +
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
    description: 'Navigate to a page in the portal. Use list_pages to discover available paths, and list_datasets, list_applications, list_events, list_news, or list_reuses to find resource slugs/refs. Optionally pass query parameters. IMPORTANT: when you search or filter data from a dataset, always offer to navigate the user to the filtered table view by passing the same filter parameters as query params to /datasets/{ref}/table.',
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
          description: 'Optional query string to append to the URL (without leading "?"). For dataset table pages, use the filterQuery from the dataset_data subagent Context. Example: "nom_search=Jean&age_lte=30&q=Paris"'
        }
      },
      required: ['path'] as const
    },
    execute: async (params) => {
      try {
        const query = params.query ? Object.fromEntries(new URLSearchParams(params.query as string)) : undefined
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
}
