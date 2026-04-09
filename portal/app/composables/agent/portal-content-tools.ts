import type { Ref } from 'vue'
import type { $Fetch } from 'ofetch'
import { useAgentTool } from '@data-fair/lib-vue-agents'
import { createAgentTranslator, agentToolError } from './utils'

const messages: Record<string, Record<string, string>> = {
  fr: {
    listApplications: 'Lister les visualisations',
    listEvents: 'Lister les événements',
    listNews: 'Lister les actualités',
    listReuses: 'Lister les réutilisations'
  },
  en: {
    listApplications: 'List applications',
    listEvents: 'List events',
    listNews: 'List news',
    listReuses: 'List reuses'
  }
}

export function useAgentPortalContentTools (locale: Ref<string>, localFetch: $Fetch, portalId: string) {
  const t = createAgentTranslator(messages, locale)

  useAgentTool({
    name: 'list_applications',
    description: 'List data visualizations (applications) published on this portal. Returns title, slug, and summary for each application.',
    annotations: { title: t('listApplications'), readOnlyHint: true },
    inputSchema: {
      type: 'object' as const,
      properties: {
        q: { type: 'string' as const, description: 'Optional full-text search query' },
        size: { type: 'number' as const, description: 'Number of results to return (default 10, max 50)' },
        page: { type: 'number' as const, description: 'Page number (default 1)' }
      }
    },
    execute: async (params) => {
      try {
        const size = Math.min(Math.max(params.size || 10, 1), 50)
        const page = Math.max(params.page || 1, 1)
        const query: Record<string, string> = {
          select: 'id,slug,title,summary,updatedAt',
          publicationSites: 'data-fair-portals:' + portalId,
          size: String(size),
          skip: String((page - 1) * size),
          sort: 'createdAt:-1'
        }
        if (params.q) query.q = params.q

        const data = await localFetch<any>('/data-fair/api/v1/applications', { query })
        const items = (data.results || []).map((app: any) =>
          `- **${app.title}** (ref: \`${app.slug || app.id}\`)${app.summary ? ` — ${app.summary}` : ''}`
        )
        const text = items.length > 0
          ? `**Applications** (${data.count} total, showing page ${page}):\n${items.join('\n')}`
          : 'No applications found.'
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return agentToolError('Failed to list applications', err)
      }
    }
  })

  useAgentTool({
    name: 'list_events',
    description: 'List events published on this portal. Returns title, slug, and dates for each event.',
    annotations: { title: t('listEvents'), readOnlyHint: true },
    inputSchema: {
      type: 'object' as const,
      properties: {
        size: { type: 'number' as const, description: 'Number of results to return (default 10, max 50)' },
        includePast: { type: 'boolean' as const, description: 'Include past events (default false, only upcoming events)' }
      }
    },
    execute: async (params) => {
      try {
        const size = Math.min(Math.max(params.size || 10, 1), 50)
        const query: Record<string, string> = {
          size: String(size),
          sort: 'startDate:1'
        }
        if (params.includePast) query.includePast = 'true'

        const data = await localFetch<any>('/portal/api/events', { query })
        const items = (data.results || []).map((event: any) => {
          const meta = event.eventMetadata || {}
          const dates = meta.startDate ? ` (${meta.startDate}${meta.endDate ? ' - ' + meta.endDate : ''})` : ''
          return `- **${event.title}** (slug: \`${meta.slug}\`)${dates}`
        })
        const text = items.length > 0
          ? `**Events** (${data.count} total):\n${items.join('\n')}`
          : 'No events found.'
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return agentToolError('Failed to list events', err)
      }
    }
  })

  useAgentTool({
    name: 'list_news',
    description: 'List news articles published on this portal. Returns title, slug, and date for each article.',
    annotations: { title: t('listNews'), readOnlyHint: true },
    inputSchema: {
      type: 'object' as const,
      properties: {
        q: { type: 'string' as const, description: 'Optional full-text search query' },
        size: { type: 'number' as const, description: 'Number of results to return (default 10, max 50)' }
      }
    },
    execute: async (params) => {
      try {
        const size = Math.min(Math.max(params.size || 10, 1), 50)
        const query: Record<string, string> = {
          size: String(size),
          sort: 'date:-1'
        }
        if (params.q) query.q = params.q

        const data = await localFetch<any>('/portal/api/news', { query })
        const items = (data.results || []).map((news: any) => {
          const meta = news.newsMetadata || {}
          const date = meta.date ? ` (${meta.date})` : ''
          return `- **${news.title}** (slug: \`${meta.slug}\`)${date}`
        })
        const text = items.length > 0
          ? `**News** (${data.count} total):\n${items.join('\n')}`
          : 'No news articles found.'
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return agentToolError('Failed to list news', err)
      }
    }
  })

  useAgentTool({
    name: 'list_reuses',
    description: 'List community reuses published on this portal. Returns title, slug, and summary for each reuse.',
    annotations: { title: t('listReuses'), readOnlyHint: true },
    inputSchema: {
      type: 'object' as const,
      properties: {
        q: { type: 'string' as const, description: 'Optional full-text search query' },
        size: { type: 'number' as const, description: 'Number of results to return (default 10, max 50)' }
      }
    },
    execute: async (params) => {
      try {
        const size = Math.min(Math.max(params.size || 10, 1), 50)
        const query: Record<string, string> = {
          size: String(size),
          sort: 'updatedAt:-1'
        }
        if (params.q) query.q = params.q

        const data = await localFetch<any>('/portal/api/reuses', { query })
        const items = (data.results || []).map((reuse: any) => {
          const config = reuse.config || {}
          const title = config.title || reuse.slug || reuse._id
          const summary = config.summary ? ` — ${config.summary}` : ''
          return `- **${title}** (slug: \`${reuse.slug}\`)${summary}`
        })
        const text = items.length > 0
          ? `**Reuses** (${data.count} total):\n${items.join('\n')}`
          : 'No reuses found.'
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return agentToolError('Failed to list reuses', err)
      }
    }
  })
}
