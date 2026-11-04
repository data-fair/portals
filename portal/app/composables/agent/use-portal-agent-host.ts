import type { Ref } from 'vue'
import type { $Fetch } from 'nitropack/types'
import type { PortalConfig } from '#api/types/portal-config'
import type { NavigationStore } from '../use-navigation-store'
import { useFrameServer, useAgentState } from '@data-fair/lib-vue-agents'
import { useAgentDatasetTools } from './dataset-tools'
import { useAgentDatasetDataTools } from './dataset-data-tools'
import { useAgentNavigationTools } from './navigation-tools'
import { useAgentGeoTools } from './geo-tools'
import { useAgentPortalContentTools } from './portal-content-tools'
import { portalAgentGuidance } from './portal-agent-guidance'

/**
 * Registers the portal-level WebMCP host (frame server + base tools) so the
 * agent tools are always available on the tab BroadcastChannel, independent of
 * whether the global agent chat is displayed. The `agentChat.active` toggle now
 * only gates the chat display (see agent-chat.vue), not tool availability.
 *
 * Must run client-side, inside a Vue effect scope (component setup): useAgentTool
 * relies on onScopeDispose for cleanup, and useFrameServer touches
 * navigator/BroadcastChannel. Order matters: useFrameServer first (installs the
 * BrowserMcpServer on navigator.modelContext), then the tool composables.
 *
 * It also publishes the portal's guidance to the chat as keyed host state
 * (portal-agent-guidance.ts): agents libs 0.7 ignore a host-supplied system prompt.
 *
 * The navigation store must be passed explicitly because this composable runs
 * in app.vue's own setup — inject() would search the parent (NuxtRoot) where
 * the store has not been provided.
 */
export function usePortalAgentHost (opts: {
  locale: Ref<string>
  localFetch: $Fetch
  portalConfig: PortalConfig
  portalId: string
  ownerName?: string
  navigationStore: NavigationStore
}) {
  useFrameServer('portal')
  useAgentDatasetTools(opts.locale, opts.localFetch)
  useAgentDatasetDataTools(opts.locale, opts.localFetch)
  useAgentNavigationTools({
    locale: opts.locale,
    portalConfig: opts.portalConfig,
    navigationStore: opts.navigationStore,
    localFetch: opts.localFetch
  })
  useAgentGeoTools(opts.locale)
  useAgentPortalContentTools(opts.locale, opts.localFetch, opts.portalId)
  const guidance = portalAgentGuidance(opts.portalConfig, opts.ownerName, window.location.origin)
  for (const [key, text] of Object.entries(guidance)) useAgentState(key, text)
}
