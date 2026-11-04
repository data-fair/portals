/**
 * One judged conversation with an autonomous agent of test_org1, on the agents page itself: the
 * conversation loop and the evidence it leaves (simulations/tmp/sim-<name>.json and .run.json).
 *
 * Not lib-agents-sim's runSimulation: that one drives the chat inside a frame of the host page (the
 * back-office drawer, the portal's chat), and here the chat IS the page. The loop is the same.
 * The test fails only when the run itself is invalid; whether the person was served is the judge's call.
 */
import type { Page } from '@playwright/test'
import {
  createChatDriver, createPagePerception, nextUserMessage, isDone, resolveUserModel, writeEvidence,
  parseConversationExport, runErrors, assertBridgeUp, REVIEW_CONSENT_COOKIE, REVIEW_CONSENT_YES,
  type TranscriptInput, type ParsedExport
} from '@data-fair/lib-agents-sim'
import { fetchConversationExports, OWNER, OWNER_ADMIN_ID, ROOT } from './settings.ts'
import { readPortalsState } from './fixtures.ts'
import type { AgentCase, AgentSeedIds, PortalsState } from './autonomous-agent.ts'

// Same ceiling and models as lib-agents-sim's runSimulation: maxTurns × 5 minutes stays inside the
// 45-minute test budget (defineSimConfig), so a wedged turn is a recorded invalid run.
const TURN_CEILING_MS = 5 * 60 * 1000
export const ASSISTANT_MODEL = process.env.SIM_ASSISTANT_MODEL ?? 'sonnet'
export const TOOLS_MODEL = process.env.SIM_TOOLS_MODEL ?? 'haiku'
const USER_MODEL = resolveUserModel()

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
  const started = Date.now()
  const consoleErrors: string[] = []
  let turns = 0
  let error: string | undefined

  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`))
  // The persona has no dialog tool: confirm what a person would, and keep a trace for the judge.
  page.on('dialog', async dialog => {
    consoleErrors.push(`dialog accepted by the runner: ${dialog.type()} « ${dialog.message()} »`)
    await dialog.accept()
  })
  // Consent answered up front: the run is read back through the conversation export, which only
  // covers threads the person agreed to have reviewed.
  await page.context().addCookies([{ name: REVIEW_CONSENT_COOKIE, value: REVIEW_CONSENT_YES, url: ROOT }])

  const conversation: Array<{ role: string, text: string }> = []
  let perception: ReturnType<typeof createPagePerception> | undefined
  let ids: AgentSeedIds | undefined
  let before: PortalsState | undefined

  // Written up front and overwritten on the way out: a test timeout aborts the body without
  // running the catch, and a previous run's evidence must never be read as this run's.
  writeEvidence(simCase.name, {
    case: simCase.name,
    surface: simCase.surface,
    goal: simCase.goal,
    persona: simCase.persona,
    route: simCase.route,
    conversation: [],
    consoleErrors: [],
    observations: [],
    exports: []
  }, {
    case: simCase.name,
    valid: false,
    error: 'run did not complete (timed out or was killed)',
    assistantModel: ASSISTANT_MODEL,
    toolsModel: TOOLS_MODEL,
    userModel: USER_MODEL,
    turns: 0,
    durationMs: 0,
    finishedAt: new Date().toISOString()
  })

  try {
    // Setup inside the try: a case that fails to dispatch must still write an invalid sidecar naming the error.
    await assertBridgeUp()
    ids = await setup()
    before = await readPortalsState(ids.portalId)

    // Into the agent's organization: an instructor is resolved against the session's active account.
    await goToWithAuth(simCase.route, OWNER_ADMIN_ID, { org: OWNER.id })
    const chat = createChatDriver(page, { locale: 'fr' })
    await chat.prepare()
    // offLimits: the composer belongs to the runner, not the persona.
    perception = createPagePerception([{ label: 'page', root: page }], { offLimits: chat.offLimits })

    // Set when the agent ended a turn by declaring wait_for_user_action: it handed control to the
    // person, who only exists inside nextUserMessage — so the next pass is where they act on it.
    let handedOver = false

    for (let i = 0; i < simCase.maxTurns; i++) {
      perception.setTurn(i + 1)
      const message = await nextUserMessage(simCase, conversation, simCase.maxTurns - i, { perception })
      if (handedOver) {
        handedOver = (await chat.waitForTurn(TURN_CEILING_MS)) === 'waiting'
        const resumed = await chat.readConversation()
        const changed = resumed.length !== conversation.length
        conversation.length = 0
        conversation.push(...resumed)
        if (changed) continue
      }
      if (isDone(message)) break
      if (message === '') {
        // the persona produced no text at all: not a clean stop
        error = `simulated user returned no message (empty completion) on turn ${i + 1}`
        break
      }
      await chat.sendMessage(message, { readyTimeoutMs: TURN_CEILING_MS })
      handedOver = (await chat.waitForTurn(TURN_CEILING_MS)) === 'waiting'
      // read first, then replace: a throw from readConversation must not empty the transcript
      const read = await chat.readConversation()
      conversation.length = 0
      conversation.push(...read)
      turns++
    }

    if (turns === 0 && !error) error = 'no turns completed — the simulated user stopped before saying anything'
    if (conversation.length === 0 && !error) error = 'transcript is empty — messages were sent but readConversation matched nothing, so the chat markup has probably moved'
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  // Outside the try, so an invalid run still carries whatever the agent managed to do. Evidence
  // gathering never turns a good run into a failed one.
  let exports: TranscriptInput['exports'] = []
  const evidenceErrors: string[] = []
  try {
    exports = await fetchConversationExports(new Date(started))
  } catch (err) {
    evidenceErrors.push(`could not export the run's conversations: ${err instanceof Error ? err.message : String(err)}`)
  }
  if (!error && !evidenceErrors.length && exports.length === 0) error = 'no conversation was exported — the chat never reached the agents service, or the review is off'

  let parsed: ParsedExport[] = []
  try {
    parsed = exports.map(parseConversationExport)
  } catch (err) {
    evidenceErrors.push(`could not read the exports: ${err instanceof Error ? err.message : String(err)}`)
  }

  let after: PortalsState | undefined
  if (ids) {
    try {
      after = await readPortalsState(ids.portalId)
    } catch (err) {
      evidenceErrors.push(`could not read the portals state after the run: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  let hostState: Record<string, unknown> | undefined
  // a provider failure overrides everything else: every other symptom is downstream of it
  const failures = runErrors(parsed)
  if (failures.length) error = `provider or run error (run is not judgeable): ${failures[0]}`
  else if (!error) {
    // a run that never reached the situation its case is about tested nothing: invalid, not judged
    if (!ids || !before || !after) error = 'premise not checked: the portals state could not be read'
    else if (!simCase.premise.holds({ exports: parsed, ids, before, after })) error = `premise not met: ${simCase.premise.description}`
  }
  if (simCase.check && ids && before && after) {
    try {
      hostState = simCase.check({ exports: parsed, ids, before, after })
    } catch (err) {
      evidenceErrors.push(`could not check the stored state: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const transcript: TranscriptInput = {
    case: simCase.name,
    surface: simCase.surface,
    goal: simCase.goal,
    persona: simCase.persona,
    route: simCase.route,
    conversation,
    consoleErrors,
    observations: perception?.observations ?? [],
    exports,
    ...(hostState ? { hostState } : {}),
    ...(evidenceErrors.length ? { evidenceErrors } : {})
  }
  writeEvidence(simCase.name, transcript, {
    ...(hostState ? { check: hostState } : {}),
    case: simCase.name,
    valid: !error,
    error,
    assistantModel: ASSISTANT_MODEL,
    toolsModel: TOOLS_MODEL,
    userModel: USER_MODEL,
    turns,
    durationMs: Date.now() - started,
    finishedAt: new Date().toISOString()
  })

  // An invalid run must never be judged, so surface it as a test failure.
  if (error) throw new Error(`run invalid: ${error}`)
}
