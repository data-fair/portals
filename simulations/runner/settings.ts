/**
 * Point the simulation owner's agent settings at the Claude Code bridge, so the
 * assistant under test runs on a real model instead of the dev mock provider,
 * and turn on the data-fair back-office chat for that owner.
 */
import { seedAgentsSettings, type ConversationExport } from '@data-fair/lib-agents-sim'
import { axiosAuth } from '../../tests/support/axios.ts'

export const ROOT = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}`

/** An org: the account shape portals are managed in. test_ data is wiped by test cleanups. */
export const OWNER = { type: 'organization', id: 'test_org1', name: 'Test Org 1' } as const
/** Admin of OWNER per dev/resources/organizations.json. */
export const OWNER_ADMIN_EMAIL = 'test_admin@test.com'
/** Its user id, whose conversations a back-office case resumes. */
export const OWNER_ADMIN_ID = 'test_admin'
/** Global admin, needed to write another owner's agent settings. */
const SUPER_ADMIN_EMAIL = 'test_superadmin@test.com'

/** Agents settings, credit cap lifted, data-fair chat on. */
export async function seedSettings (assistantModelId: string, toolsModelId: string) {
  const admin = await axiosAuth({ email: SUPER_ADMIN_EMAIL, adminMode: true })
  await seedAgentsSettings(admin, `${ROOT}/agents`, OWNER, assistantModelId, toolsModelId)
  const ownerAx = await axiosAuth({ email: OWNER_ADMIN_EMAIL, org: OWNER.id })
  // PATCH merges, preserving the owner's other data-fair settings.
  await ownerAx.patch(`${ROOT}/data-fair/api/v1/settings/${OWNER.type}/${OWNER.id}`, { agentChat: true })
}

/** A row of the agents review listing (`startedAt` is the conversation's creation). */
type ListedConversation = { conversationId: string, userId?: string, agentId?: string, startedAt?: string }

/**
 * The conversations of a run: the owner's, created since it started. Not filtered on the person:
 * a portal case is an anonymous visitor, and the cases run one at a time.
 */
export function runConversations <T extends ListedConversation> (listed: T[], since: Date): T[] {
  return listed.filter(c => !!c.startedAt && new Date(c.startedAt) >= since)
}

/**
 * lib-agents-sim's `fetchExports`: the conversation exports of the run (the agents review export,
 * the file a real session is debugged with). Every chat loop runs on the server, so this is the
 * only record of what the model was sent and what it called. The review is turned on by
 * seedAgentsSettings, the consent by runSimulation.
 */
export async function fetchConversationExports (since: Date): Promise<ConversationExport[]> {
  const admin = await axiosAuth({ email: SUPER_ADMIN_EMAIL, adminMode: true })
  const base = `${ROOT}/agents/api/review/${OWNER.type}/${OWNER.id}`
  const listed = (await admin.get(`${base}?size=200`)).data.results as ListedConversation[]
  const exports: ConversationExport[] = []
  for (const conversation of runConversations(listed, since)) {
    // text: the body is JSONL, which axios would otherwise try to parse as one JSON value
    const res = await admin.get(`${base}/${conversation.conversationId}/export`, { responseType: 'text', transformResponse: [(data: string) => data] })
    exports.push({ conversationId: conversation.conversationId, agentId: conversation.agentId, jsonl: res.data })
  }
  return exports
}

/**
 * Erase `userId`'s conversations on the owner, before a case. Opening the chat resumes the person's
 * latest thread: without this a back-office case continued the previous case's conversation and
 * created none for fetchConversationExports to find. `DELETE /api/test-env` resets portals, not the
 * agents service.
 */
export async function eraseConversations (userId: string): Promise<void> {
  const admin = await axiosAuth({ email: SUPER_ADMIN_EMAIL, adminMode: true })
  await admin.delete(`${ROOT}/agents/api/review/${OWNER.type}/${OWNER.id}`, { params: { userId } })
}
