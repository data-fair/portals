/**
 * Point the simulation owner's agent settings at the Claude Code bridge, so the
 * assistant under test runs on a real model instead of the dev mock provider,
 * and turn on the data-fair back-office chat for that owner.
 */
import { seedAgentsSettings } from '@data-fair/lib-agents-sim'
import { axiosAuth } from '../../tests/support/axios.ts'

export const ROOT = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}`

/** An org: the account shape portals are managed in. test_ data is wiped by test cleanups. */
export const OWNER = { type: 'organization', id: 'test_org1', name: 'Test Org 1' } as const
/** Admin of OWNER per dev/resources/organizations.json. */
export const OWNER_ADMIN_EMAIL = 'test_admin@test.com'
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
