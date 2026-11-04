/**
 * The autonomous agents the cases drive: owned by test_org1, each acting as its own NHI, calling the
 * mcp server's tools (portals_* and datafair_*) — the configuration production runs.
 *
 * The NHIs are declared in simple-directory's file storage (dev/resources/users.template.json) with
 * the subject autonomous-agent:<agentId>, which pins the agent id; each NHI holds one scope set, so a
 * case picks its scopes by picking its agent. The public creation route always generates the id, so
 * the agent is seeded through the agents test-env route (development mode only), as data-fair's
 * simulations do.
 */
import type { ParsedExport, SimulationCase } from '@data-fair/lib-agents-sim'
import { OWNER, OWNER_ADMIN_ID, ROOT } from './settings.ts'

/** Agent id → its NHI user id (dev/resources/users.template.json), with the scopes the NHI holds. */
export const AGENT_IDENTITIES = {
  'sim-pages-write': { nhi: 'test_org1_pages_write_nhi', scopes: ['pages:write', 'portals:read', 'datasets:read', 'applications:read'] },
  'sim-pages-admin': { nhi: 'test_org1_pages_admin_nhi', scopes: ['pages:admin', 'portals:read', 'datasets:read'] },
  'sim-pages-read': { nhi: 'test_org1_pages_read_nhi', scopes: ['pages:read', 'portals:read'] },
  'sim-portals-write': { nhi: 'test_org1_portals_write_nhi', scopes: ['portals:write', 'pages:read'] }
} as const

export type AgentId = keyof typeof AGENT_IDENTITIES

const SUPER_ADMIN_EMAIL = 'test_superadmin@test.com'

export interface SimulatedAgentConfig {
  title?: string
  persona?: string
  instructions?: string
  /** References into the agents service's MCP_SERVERS catalog, beside the platform mcp every agent with an identity has built in (PRIVATE_MCP_URL). */
  mcpServers?: Array<{ serverId: string, toolFilter?: string[] }>
}

export const DEFAULT_SIMULATED_AGENT: Required<SimulatedAgentConfig> = {
  title: 'Assistant du portail de l\'organisation',
  // The role alone, as an admin would write it: style or honesty rules here would hide whether the
  // agents service's own prompt carries them.
  persona: 'Tu es l\'assistant du portail de données de l\'organisation.',
  instructions: '',
  mcpServers: []
}

/** What the cases' fixtures seeded (runner/fixtures.ts seedAgentFixtures). */
export type AgentSeedIds = {
  portalId: string,
  homePageId: string,
  catalogPageId: string,
  /** The published free page « Nos actions pour la jeunesse », attached to the portal. */
  contentPageId: string,
  /** The free page whose draft was prepared and never published, attached to no portal. */
  draftPageId: string,
  datasetIds: string[],
  applicationId: string
}

/** A page as stored, the fields a premise or a check reads. */
export type StoredPage = {
  _id: string,
  type: string,
  title?: string,
  portals: string[],
  requestedPortals?: string[],
  config: Record<string, any>,
  draftConfig: Record<string, any>
}

/** The portals state of test_org1, read through the portals API as its admin. */
export type PortalsState = {
  portal: { _id: string, config: Record<string, any>, draftConfig: Record<string, any> },
  pages: StoredPage[]
}

/** What a premise and a check are given: the run's conversation exports, the seeded ids, the state before and after. */
export type RunState = { exports: ParsedExport[], ids: AgentSeedIds, before: PortalsState, after: PortalsState }

export type AgentCase = SimulationCase & {
  surface: 'autonomous-agent',
  agent: AgentId,
  /** Checked before any model call (assertAgentTools): a run without them would test nothing. */
  tools: { required: string[], forbidden?: string[] },
  /** What must have happened for the run to have tested its case; an invalid run is never judged. */
  premise: { description: string, holds: (state: RunState) => boolean },
  /**
   * The stored state the judge is shown beside the transcript (the transcript's hostState). Evidence, never a verdict: a wrong outcome is the judge's to read, not an invalid run.
   */
  check?: (state: RunState) => Record<string, unknown>
}

export const agentRoute = (agentId: AgentId) => `/agents/${OWNER.type}/${OWNER.id}/chat?agentId=${agentId}`

const superAdmin = async () => {
  const { axiosAuth } = await import('../../tests/support/axios.ts')
  return axiosAuth({ email: SUPER_ADMIN_EMAIL, adminMode: true })
}

/**
 * Create the agent afresh, enrolled with its NHI, instructed by test_admin. Deleted first, which
 * takes its conversations with it: the agents page reopens the agent's latest thread, so a kept
 * history would carry an earlier run's conversation into this one.
 */
export async function seedAutonomousAgent (agentId: AgentId, nhi: string = AGENT_IDENTITIES[agentId].nhi, config: SimulatedAgentConfig = {}) {
  const admin = await superAdmin()
  await admin.delete(`${ROOT}/agents/api/autonomous-agents/${OWNER.type}/${OWNER.id}/${agentId}`, { validateStatus: status => status < 300 || status === 404 })
  await admin.post(`${ROOT}/agents/api/test-env/autonomous-agent`, {
    id: agentId,
    owner: { type: OWNER.type, id: OWNER.id },
    clientId: nhi,
    siteUrl: ROOT,
    issuer: `${ROOT}/agents/api/nhi`,
    autonomousAgent: {
      ...DEFAULT_SIMULATED_AGENT,
      ...config,
      instructors: [{ mode: 'member', type: 'user', id: OWNER_ADMIN_ID }],
      enabled: true
    }
  })
}

/**
 * The agents service keys catalog tools by their bare name; a `<server>__` prefix is accepted too, so
 * a change of naming there does not silently invalidate every run.
 */
export const toolMatches = (toolName: string, name: string) => toolName === name || toolName.endsWith(`__${name}`)

/** A tool name without the `<server>__` prefix the agents service may give it. */
export const bareToolName = (toolName: string) => {
  const sep = toolName.lastIndexOf('__')
  return sep === -1 ? toolName : toolName.slice(sep + 2)
}

/** The `required` tools missing from `offered`, and the `forbidden` ones offered anyway. Pure. */
export function toolsMismatch (offered: string[], required: string[], forbidden: string[] = []) {
  return {
    missing: required.filter(name => !offered.some(n => toolMatches(n, name))),
    unexpected: offered.filter(n => forbidden.some(name => toolMatches(n, name)))
  }
}

/**
 * Fail before any model call when the agent cannot reach its tools, or reaches some its scopes must
 * deny. The diagnostic performs the NHI exchange and lists the tools as the agent would get them, so a
 * broken issuer, a missing NHI or an mcp server that composed nothing is named here, not discovered as
 * a run where the agent "has no tools". Returns the tool names.
 */
export async function assertAgentTools (agentId: AgentId, required: string[], forbidden: string[] = []) {
  const admin = await superAdmin()
  let names: string[]
  try {
    const res = await admin.get(`${ROOT}/agents/api/autonomous-agents/${OWNER.type}/${OWNER.id}/${agentId}/tools`)
    names = (res.data.results as Array<{ name: string }>).map(t => t.name)
  } catch (err: any) {
    throw new Error(`the autonomous agent ${agentId} cannot list its tools (NHI exchange or mcp server): ${err.status ?? ''} ${typeof err.data === 'string' ? err.data : JSON.stringify(err.data ?? err.message)}`)
  }
  const { missing, unexpected } = toolsMismatch(names, required, forbidden)
  if (missing.length) throw new Error(`the autonomous agent ${agentId} lacks ${missing.join(', ')}; it has: ${names.join(', ') || 'no tools'}`)
  if (unexpected.length) throw new Error(`the autonomous agent ${agentId} is offered ${unexpected.join(', ')}, which its scopes must deny; it has: ${names.join(', ')}`)
  return names
}

export type ToolPart = { type?: string, toolName?: string, state?: string, input?: unknown, __ref?: string, data?: { parts?: ToolPart[] } }

/**
 * Whether a conversation called the tool, optionally with an input matching `input`. A call a code_mode
 * script made counts too: it is recorded as a part of the script's `data-trace` part.
 * `name` may be a test of the bare tool name, for a family of tools.
 */
export function calledTool (exports: ParsedExport[], name: string | ((bareName: string) => boolean), input?: (input: any) => boolean): boolean {
  const nameMatches = typeof name === 'string' ? (toolName: string) => toolMatches(toolName, name) : (toolName: string) => name(bareToolName(toolName))
  return exports.some(exported => {
    const matches = (stub: ToolPart): boolean => {
      // a part too large for its message line is lifted into a blob record, with a stub left behind
      const part = (stub.__ref ? exported.blobs.get(stub.__ref) as ToolPart | undefined : undefined) ?? stub
      if (part.type === 'data-trace') return (part.data?.parts ?? []).some(matches)
      return part.type === 'dynamic-tool' && !!part.toolName && nameMatches(part.toolName) && (!input || input(part.input))
    }
    return exported.messages.some(message => (message.parts as ToolPart[]).some(matches))
  })
}
