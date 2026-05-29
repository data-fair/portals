import { useAgentTool } from '@data-fair/lib-vue-agents'

/**
 * Each shared-filters page block self-registers one of these so the agent can
 * discover what the block is and which filter keys it honors. Call only when
 * element.syncParams === 'shared-filters'. The tool is named per-block (by uuid)
 * so multiple describe tools can coexist on one page without colliding, and it
 * unregisters automatically when the block unmounts.
 */
export function usePageFilterDescribeTool (opts: {
  uuid: string
  title: string // human label shown in the agent UI
  description: string // static text: what the block is + accepted key prefixes
}) {
  useAgentTool({
    name: `describe_filters_${opts.uuid}`,
    description: opts.description,
    annotations: { title: opts.title, readOnlyHint: true },
    inputSchema: { type: 'object' as const, properties: {} },
    execute: async () => ({ content: [{ type: 'text' as const, text: opts.description }] })
  })
}
