/**
 * One judged conversation with an autonomous agent of test_org1, on the agents page itself, through
 * lib-agents-sim's runSimulation: the chat is the page (`chatFrame: null`), and the portals state read
 * back after the run is this host's own check (`afterRun`): the case's premise (a run that never reached
 * its situation is invalid, not judged) and the state the judge reads (`hostState`).
 * The test fails only when the run itself is invalid; whether the person was served is the judge's call.
 */
import type { Page } from '@playwright/test'
import { runSimulation, parseConversationExport, type ParsedExport } from '@data-fair/lib-agents-sim'
import { fetchConversationExports, OWNER, OWNER_ADMIN_ID, ROOT } from './settings.ts'
import { readPortalsState } from './fixtures.ts'
import type { AgentCase, AgentSeedIds, PortalsState } from './autonomous-agent.ts'

// The models runSimulation pins (SIM_ASSISTANT_MODEL, SIM_TOOLS_MODEL), for the settings the setup seeds.
export const ASSISTANT_MODEL = process.env.SIM_ASSISTANT_MODEL ?? 'sonnet'
export const TOOLS_MODEL = process.env.SIM_TOOLS_MODEL ?? 'haiku'

type GoToWithAuth = (url: string, user: string, opts?: { org?: string, dep?: string, adminMode?: boolean }) => Promise<void>

/**
 * Run one case: `setup` seeds what the case needs, after the bridge check, and returns the seeded ids.
 * The portals state is read once the setup is done and once the conversation is over; the case's
 * premise and check read both, with the conversation exports.
 */
export async function runAgentCase (
  simCase: AgentCase,
  page: Page,
  goToWithAuth: GoToWithAuth,
  setup: () => Promise<AgentSeedIds>
): Promise<void> {
  let ids: AgentSeedIds | undefined
  let before: PortalsState | undefined

  await runSimulation(page, simCase, {
    agentsUrl: ROOT,
    locale: 'fr',
    // the agents page: the chat is the page, not a frame of the host
    chatFrame: null,
    perceptionRoots: [{ label: 'page', root: page }],
    fetchExports: fetchConversationExports,
    setup: async () => {
      ids = await setup()
      before = await readPortalsState(ids.portalId)
      // into the agent's organization: an instructor is resolved against the session's active account
      await goToWithAuth(simCase.route, OWNER_ADMIN_ID, { org: OWNER.id })
    },
    afterRun: async ({ exports, error }) => {
      const parsed: ParsedExport[] = exports.map(parseConversationExport)
      let after: PortalsState | undefined
      let readError = ''
      if (ids) {
        try {
          after = await readPortalsState(ids.portalId)
        } catch (err: any) {
          readError = ` (${err?.response ? `${err.response.status} ${String(err.response.data).slice(0, 200)}` : err instanceof Error ? err.message : String(err)})`
        }
      }
      // a run that never reached the situation its case is about tested nothing: invalid, not judged
      const premiseError = error
        ? undefined
        : (!ids || !before || !after)
            ? `premise not checked: the portals state could not be read${readError}`
            : !simCase.premise.holds({ exports: parsed, ids, before, after })
                ? `premise not met: ${simCase.premise.description}`
                : undefined
      // the judge reads the stored state even of an invalid run: what the agent managed to do
      let hostState: Record<string, unknown> | undefined
      if (simCase.check && ids && before && after) {
        try {
          hostState = simCase.check({ exports: parsed, ids, before, after })
        } catch (err) {
          hostState = { checkFailed: `could not check the stored state: ${err instanceof Error ? err.message : String(err)}` }
        }
      }
      return { ...(premiseError ? { error: premiseError } : {}), ...(hostState ? { hostState } : {}) }
    }
  })
}
