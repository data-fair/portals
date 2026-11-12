import type { Ref } from 'vue'
import type { Page } from '#api/types/page/index.ts'
import { ofetch } from 'ofetch'
import { useAgentTool } from '@data-fair/lib-vue-agents'

type PreviewResult = { image: { data: string, mediaType: string }, text: string }

const titles: Record<string, string> = { fr: 'Prévisualiser la page', en: 'Preview the page' }

/**
 * The page preview of the agents' mcp tool (portals_preview_portal_page), as a WebMCP tool of the
 * page screens, for the back-office assistant: the same route, called with the person's session. The
 * screenshot is a real image part for the model (the agents' page-tool path keeps MCP image parts).
 */
export function usePagePreviewWebMCP (pageId: string, page: Ref<Page | null | undefined>, previewPortalId: Ref<string | null | undefined>, locale: Ref<string>) {
  useAgentTool({
    name: 'preview_page',
    description: 'Render this page as a visitor would and return a screenshot, the page\'s accessibility snapshot and what went wrong (console errors, failed API calls, timeout). Console warnings are only counted and never matter: ignore them. The screenshot is for you: the person never sees it, so describe what it shows, and to let them see the page themselves point to « Aperçu (brouillon) » (the draft) or « Voir sur <portal> » (the published page) on the page screen. By default it renders the saved draft as the page editor previews it: the blocks with the portal\'s theme, without the portal\'s header and footer, catalogs showing placeholder items. With draft=false it renders the published page on the portal. Only a page attached to a portal, or whose publication is requested on one, can be rendered. Use it to check a change renders as intended, before the person validates the draft.',
    annotations: { title: titles[locale.value] ?? titles.en, readOnlyHint: true },
    inputSchema: {
      type: 'object' as const,
      properties: {
        draft: { type: 'boolean' as const, description: 'true (default): the saved draft; false: the published page on the portal' },
        viewport: { type: 'string' as const, enum: ['desktop', 'mobile'], description: 'default desktop' },
        fullPage: { type: 'boolean' as const, description: 'Capture the whole height instead of the visible screen (default false: a tall capture is shrunk before you see it)' }
      }
    },
    execute: async (params) => {
      const query: Record<string, string> = {}
      if (params.draft !== undefined) query.draft = String(params.draft)
      if (params.viewport) query.viewport = params.viewport
      if (params.fullPage !== undefined) query.fullPage = String(params.fullPage)
      // the portal of « Portail de prévisualisation » when the page can be rendered on it, else the server's default
      const portal = previewPortalId.value
      if (portal && (page.value?.portals.includes(portal) || page.value?.requestedPortals?.includes(portal))) query.portal = portal
      try {
        const res = await ofetch<PreviewResult>(`${$apiPath}/pages/${encodeURIComponent(pageId)}/preview`, { query })
        return { content: [{ type: 'text' as const, text: res.text }, { type: 'image' as const, data: res.image.data, mimeType: res.image.mediaType }] }
      } catch (err: any) {
        const message = typeof err?.data === 'string' ? err.data : (err?.data?.message ?? err?.message ?? String(err))
        return { content: [{ type: 'text' as const, text: `The page could not be previewed: ${message}` }], isError: true }
      }
    }
  })
}
