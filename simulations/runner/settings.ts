/**
 * Point the simulation owner's agent settings at the Claude Code bridge, so the
 * assistant under test runs on a real model instead of the dev mock provider,
 * and turn on the data-fair back-office chat for that owner.
 */
import { axiosAuth } from '../../tests/support/axios.ts'

const ROOT = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}`

export const BRIDGE_URL = process.env.BRIDGE_URL ?? `http://localhost:${process.env.BRIDGE_PORT ?? 3194}/v1`

/** An org: the account shape portals are managed in. test_ data is wiped by test cleanups. */
export const OWNER = { type: 'organization', id: 'test_org1', name: 'Test Org 1' } as const
/** Admin of OWNER per dev/resources/organizations.json. */
export const OWNER_ADMIN_EMAIL = 'test_admin@test.com'
/** Global admin, needed to write another owner's agent settings. */
const SUPER_ADMIN_EMAIL = 'test_superadmin@test.com'

export const MODEL_ROLES = ['assistant', 'tools', 'summarizer', 'evaluator', 'moderator'] as const
type Role = typeof MODEL_ROLES[number]

/**
 * Roles a deployment puts on a small model: sub-agents, compaction, the moderation
 * guard. Running them on the assistant's model would cost more per case and flatter
 * the product. The evaluator reviews traces no run exercises, so it follows the
 * assistant.
 */
const BACKGROUND_ROLES: readonly Role[] = ['tools', 'summarizer', 'moderator']

const provider = {
  id: 'bridge',
  type: 'openai-compatible',
  name: 'Claude Code Bridge',
  enabled: true,
  baseURL: BRIDGE_URL,
  // MANDATORY: in 'default' mode the provider targets /v1/responses, which the bridge does not implement.
  compatibility: 'compatible'
}

const unlimited = { unlimited: true, monthlyLimit: 0 }
/** Every role unlimited: portal cases are anonymous visitors, back-office cases are admins. */
const quotas = { admin: unlimited, contrib: unlimited, user: unlimited, external: unlimited, anonymous: unlimited, untrusted: unlimited }

/**
 * The two bodies the agents API takes: `superadmin` (the provider and the model
 * catalog, each model listing the roles it may serve) and `org` (which model each
 * role uses, quotas, traces). The org body is validated against the catalog, so it
 * is written second.
 */
export function bridgeSettings (assistantModelId: string, toolsModelId: string) {
  const bridge = { type: 'openai-compatible', id: 'bridge', name: 'Claude Code Bridge' }
  const modelFor = (role: Role) => BACKGROUND_ROLES.includes(role) ? toolsModelId : assistantModelId
  const ids = [...new Set(MODEL_ROLES.map(modelFor))]
  return {
    superadmin: {
      providers: [provider],
      models: ids.map(id => ({
        model: { id, name: id, provider: bridge },
        usage: MODEL_ROLES.filter(role => modelFor(role) === id) as Role[],
        inputPricePerMillion: 0,
        outputPricePerMillion: 0
      }))
    },
    org: {
      modelMapping: Object.fromEntries(
        MODEL_ROLES.map(role => [role, { provider: bridge.id, id: modelFor(role), name: modelFor(role) }])
      ) as Record<Role, { provider: string, id: string, name: string }>,
      quotas,
      storeTraces: false
    }
  }
}

/** Agents settings (superadmin body, then org body), credit cap lifted, data-fair chat on. */
export async function seedSettings (assistantModelId: string, toolsModelId: string) {
  const admin = await axiosAuth({ email: SUPER_ADMIN_EMAIL, adminMode: true })
  const { superadmin, org } = bridgeSettings(assistantModelId, toolsModelId)
  await admin.put(`${ROOT}/agents/api/settings/${OWNER.type}/${OWNER.id}`, superadmin)
  await admin.put(`${ROOT}/agents/api/settings/${OWNER.type}/${OWNER.id}/org`, org)
  // The agents service caps each account's AI credits before any quota, and a
  // production-mode image defaults that cap to 0: every request is refused with a
  // 429. -1 lifts it; consumption is reset so a run never inherits the last.
  await admin.post(`${ROOT}/agents/api/v1/limits/${OWNER.type}/${OWNER.id}`, {
    lastUpdate: new Date().toISOString(),
    ai_credits: { limit: -1, consumption: 0 }
  })
  const ownerAx = await axiosAuth({ email: OWNER_ADMIN_EMAIL, org: OWNER.id })
  // PATCH merges, preserving the owner's other data-fair settings.
  await ownerAx.patch(`${ROOT}/data-fair/api/v1/settings/${OWNER.type}/${OWNER.id}`, { agentChat: true })
}

/** Fail loudly and early: without the bridge every case dies as an opaque timeout. */
export async function assertBridgeUp () {
  const statusUrl = BRIDGE_URL.replace(/\/v1$/, '') + '/_bridge/status'
  try {
    const res = await fetch(statusUrl, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (err) {
    throw new Error(
      `The Claude Code bridge is not answering at ${statusUrl} (${err instanceof Error ? err.message : String(err)}).\n` +
      'Ask your user to start it with: npm run dev-bridge'
    )
  }
}
