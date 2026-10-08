import { useAgentState } from '@data-fair/lib-vue-agents'
import { pagePublicationState } from '~/utils/agent-editor-guidance'

/**
 * Tell the agent chat on which portals the open page is published. A new page is on none,
 * and the portal menu's « Page libre » item only offers pages published on that portal: a
 * judged run looked for a page it had just created and never found it. Published from both
 * the page editor and the page view, whose « Publications » tab changes it.
 */
export function usePagePublicationAgentState () {
  const { page } = usePageStore()
  const portalsFetch = useFetch<{ results: { _id: string, title: string }[] }>($apiPath + '/portals', { query: { select: '_id,title', size: 10000 } })
  useAgentState('publication', () => {
    if (!page.value || !portalsFetch.data.value) return undefined
    const titles = Object.fromEntries(portalsFetch.data.value.results.map(p => [p._id, p.title]))
    return pagePublicationState((page.value.portals ?? []).map(id => ({ id, title: titles[id] ?? id })))
  })
}
