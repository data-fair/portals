/**
 * One judged scenario per autonomous-agent case: an agent of test_org1, acting as its own NHI, on the
 * mcp server's portals_* and datafair_* tools (simulations/cases/autonomous-agents.ts). There are no
 * assertions about what the agent should say — the test fails only when the run itself is invalid (the
 * bridge is down, the agent cannot reach its tools or reaches some its scopes must deny, the turn never
 * finished, the premise did not hold). Whether the person was served is the judge's call, from the
 * transcript, the conversation export and the stored state the case's check read back.
 *
 * A spec of its own rather than a branch of simulate.sim.spec.ts: the chat is the agents page itself
 * here, not a drawer of the back-office or the portal, and the run is set up around a seeded agent.
 */
import { test } from '../tests/fixtures/login.ts'
import { agentCases } from './cases/autonomous-agents.ts'
import { selectOwnCases } from './cases/select.ts'
import { seedAgentFixtures } from './runner/fixtures.ts'
import { seedSettings, eraseConversations, OWNER_ADMIN_ID } from './runner/settings.ts'
import { seedAutonomousAgent, assertAgentTools } from './runner/autonomous-agent.ts'
import { runAgentCase, ASSISTANT_MODEL, TOOLS_MODEL } from './runner/agent-conversation.ts'

for (const simCase of selectOwnCases(agentCases)) {
  test(`simulation: ${simCase.name}`, async ({ page, goToWithAuth }) => {
    await runAgentCase(simCase, page, goToWithAuth, async () => {
      const ids = await seedAgentFixtures()
      await seedSettings(ASSISTANT_MODEL, TOOLS_MODEL)
      const person = simCase.person ?? OWNER_ADMIN_ID
      await eraseConversations(person)
      await seedAutonomousAgent(simCase.agent, undefined, undefined, person)
      await assertAgentTools(simCase.agent, simCase.tools.required, simCase.tools.forbidden)
      return ids
    })
  })
}
