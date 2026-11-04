// relative, not #api: this module is also unit-tested from the root project (tests/features/agent-tools)
import type { PortalConfig } from '../../../../api/types/portal-config/index.ts'

/**
 * What every public portal page tells the AI chat, as keyed host state.
 *
 * It used to be the chat's system prompt, but agents libs 0.7 ignore a host-supplied
 * `systemPrompt` (`hostInitConfig`): the prompt is the agents server's. Retained host
 * state is the channel 0.7 keeps for this: the chat forwards it to the server, which
 * tells it to the model on every turn (agents docs/architecture/host-events.md), and the
 * back-office editors already publish their guidance that way.
 *
 * Several keys rather than one text: a host event detail is capped at 1000 characters
 * (EVENT_DETAIL_MAX_CHARS in @data-fair/lib-vue-agents) and a longer one is truncated
 * mid-sentence. In English, like the skills; the chat reports the person's language.
 *
 * Pure on purpose: unit-tested without a browser (tests/features/agent-tools).
 */
export function portalAgentGuidance (portalConfig: Pick<PortalConfig, 'title'>, ownerName?: string, origin?: string): Record<string, string> {
  const facts: string[] = []
  if (portalConfig.title) facts.push(`titled « ${portalConfig.title} »`)
  if (ownerName) facts.push(`managed by « ${ownerName} »`)
  if (origin) facts.push(`at ${origin}`)

  return {
    portal: `Public Data Fair data portal${facts.length ? ' ' + facts.join(', ') : ''}. The person is a visitor of this portal.`,
    'portal-data': 'Base figures, statistics and charts only on values the data tools actually returned: never invent or estimate data. When unsure, say so and point the person to a filtered view of the data they can check rather than asserting. ' +
      // a judged run opened a filtered table, then said it could not see its rows and left the
      // check to the person: the table shows the rows of the page's filters, which can be queried
      'To check what a dataset table on screen shows, read its filters with pageFilters_get and run the same query with the data tools (skill query-dataset-data): the table shows exactly those rows.',
    // judged simulations: asked to show something, the assistant handed over a link to open;
    // asked about what the person sees, it answered from memory and contradicted the screen
    'portal-screen': 'When the person wants to see something, open the page yourself with navigate instead of only giving a link. When they talk about what is on screen, first read the page with get_current_location and pageFilters_get before answering.',
    'portal-links': 'Always write links to portal pages as markdown links, reusing verbatim the absolute URL the tools give (list_pages, get_current_location, the `Link` field of datasets), for example `[See the map](<absolute dataset URL>/map?<filterQuery>)`. Never write a relative path, a bare unformatted URL or a hand-assembled URL: only fill the {slug} placeholder and the query, without touching the origin or the path prefix.'
  }
}
