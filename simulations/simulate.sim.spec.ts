/**
 * One judged scenario per case. There are no assertions about what the assistant
 * should say — the test fails only when the run itself is invalid (the bridge is
 * down, the page did not load, the turn never finished). Whether the product served
 * the person is the judge's call, from the transcript.
 *
 * Adapted from data-fair's simulations/simulate.sim.spec.ts; the turn loop and its
 * guards are kept equivalent, only reaching the case (the surface) differs.
 */
import { test } from '@playwright/test'
import { cases } from './cases/index.ts'
import { seedAll } from './runner/fixtures.ts'
import { assertBridgeUp, seedSettings } from './runner/settings.ts'
import { captureGatewayErrors } from './runner/gateway-errors.ts'
import { createSurface } from './runner/surfaces.ts'
import { passActions, withSilentPasses, type SilentPass } from './runner/silent-passes.ts'
import {
  createChatDriver,
  chatDriverStrings,
  captureGateway,
  nextUserMessage, isDone, resolveUserModel,
  writeEvidence, type Transcript,
  selectCases,
  createPagePerception
} from '@data-fair/lib-agents-sim'

// Explicit ceiling, not the driver's own 10-minute default: maxTurns × 5 minutes
// stays inside the 45-minute test budget (see playwright.sim.config.ts), so a wedged
// turn surfaces as a recorded invalid run rather than an unrecorded test-timeout
// abort. A declared wait does not eat into it: the driver reports an armed wait
// instead of sitting through it.
const TURN_CEILING_MS = 5 * 60 * 1000

const ASSISTANT_MODEL = process.env.SIM_ASSISTANT_MODEL ?? 'sonnet'
// The sub-agent, compaction and moderation roles, pinned separately and lower: that
// is where a deployment puts a small model, so that is where the product has to
// work. See BACKGROUND_ROLES in runner/settings.ts.
const TOOLS_MODEL = process.env.SIM_TOOLS_MODEL ?? 'haiku'
// Asked of the package rather than re-derived here, so the sidecar never records a
// different tier than the one that ran.
const USER_MODEL = resolveUserModel()
const ROOT = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
const selected = selectCases(cases, (process.env.SIM_CASES ?? '').split(',').map(s => s.trim()).filter(Boolean))

for (const simCase of selected) {
  test(`simulation: ${simCase.name}`, async ({ page }) => {
    const started = Date.now()
    const consoleErrors: string[] = []
    let turns = 0
    let error: string | undefined

    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()) })
    page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`))
    // The chat iframe POSTs to the agents service's gateway route, so the browser
    // sees the full message array and tool definitions. page.on covers sub-frames,
    // which is why capturing on the top-level page is enough.
    const gateway = captureGateway(page)
    // Requests say what the assistant was offered; responses say whether the model
    // actually answered. Only the second can tell a provider failure from a product one.
    const gatewayErrors = captureGatewayErrors(page)

    const conversation: Array<{ role: string, text: string }> = []
    // What the person did in a pass whose message was dropped (see runner/silent-passes.ts)
    const silentPasses: SilentPass[] = []
    let perception: ReturnType<typeof createPagePerception> | undefined

    // Written up front and overwritten on the way out. A Playwright test timeout
    // aborts the body without running the catch, so without this the previous run's
    // sidecar and verdict would still be on disk and would be read as this run's result.
    writeEvidence(simCase.name, {
      case: simCase.name,
      goal: simCase.goal,
      persona: simCase.persona,
      route: simCase.route,
      conversation: [],
      gateway: [],
      consoleErrors: [],
      observations: []
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
      // Setup lives inside the try too: a case that fails to dispatch (bridge down,
      // seeding rejected) must still write an invalid sidecar naming the error.
      await assertBridgeUp()
      const ids = await seedAll()
      await seedSettings(ASSISTANT_MODEL, TOOLS_MODEL)

      // SIM_SUB_AGENTS=0 runs the chat in its experimental flattened mode: sub-agents
      // that do not pin a model hand their tools to the assistant itself. Set through
      // the chat's own flags cookie, as its settings page does.
      if (process.env.SIM_SUB_AGENTS === '0') {
        await page.context().addCookies([{
          name: 'agent-chat-flags',
          value: encodeURIComponent(JSON.stringify({ toolExploration: false, subAgents: false, simpleSubAgents: true, mermaid: false, showReasoning: false })),
          url: `${ROOT}/agents`
        }])
      }

      // Same cookie as the e2e fixtures, on the parent domain so it reaches both the
      // back-office host and the portal subdomain: the portal's own language choice.
      await page.context().addCookies([{ name: 'i18n_lang', value: 'fr', domain: `.${process.env.DEV_HOST}`, path: '/' }])

      const surface = createSurface(simCase, page, ids)
      await surface.goto()

      const root = surface.chatFrame
      // Single source of truth for the composer's locale-dependent strings: the chat
      // driver and the perception's off-limits list must agree on what "the composer" is.
      const locale = 'fr' as const
      const strings = chatDriverStrings(locale)
      const composer = root.getByPlaceholder(strings.input)
      const ensureChatOpen = () => surface.ensureChatOpen(composer)
      await ensureChatOpen()

      const chat = createChatDriver(root, { locale })

      // offLimits: the composer belongs to the runner, not the persona. Refusing these
      // names structurally is what stops the persona from typing its message into the
      // page and pressing Send itself. `strings.reset` is off-limits because a mid-run
      // click erases the transcript the run exists to produce. Ordinary controls stay
      // reachable — including the drawer toggle, which a real user can and does click.
      perception = createPagePerception(
        surface.perceptionRoots,
        { offLimits: [strings.input, strings.send, strings.stop, strings.reset] }
      )

      // Set when the assistant ended a turn by declaring wait_for_user_action rather
      // than by finishing. It has handed control to the person, and the person only
      // exists inside nextUserMessage — so the next pass is where they act on it.
      let handedOver = false

      for (let i = 0; i < simCase.maxTurns; i++) {
        perception.setTurn(i + 1)
        const message = await nextUserMessage(simCase, withSilentPasses(conversation, silentPasses), simCase.maxTurns - i, { perception })
        if (handedOver) {
          // The pass above was the person's chance to act on the wait. If they took it,
          // the wait resolved and the assistant is finishing the turn it paused — let it,
          // rather than speaking over its reply. If they ignored it, the wait is still
          // armed and this returns 'waiting' at once.
          handedOver = (await chat.waitForTurn(TURN_CEILING_MS)) === 'waiting'
          const resumed = await chat.readConversation()
          const changed = resumed.length !== conversation.length
          const before = conversation.length
          conversation.length = 0
          conversation.push(...resumed)
          // Whatever the person wrote in that pass, they wrote it before the reply
          // their action caused. Drop it and let them read the reply first, but keep
          // what they did, where they did it.
          if (changed) {
            silentPasses.push({ at: before, actions: passActions(perception.observations, i + 1) })
            continue
          }
        }
        if (isDone(message)) break
        if (message === '') {
          // Distinct from a real stop: the persona subprocess produced no text at all
          // (refusal, swallowed error, empty completion).
          error = `simulated user returned no message (empty completion) on turn ${i + 1}`
          break
        }
        // The persona may have navigated the page — or closed the drawer itself —
        // between turns, so re-open before sending.
        await ensureChatOpen()
        // While the assistant works, the send control is Stop: an ordinary wait for a
        // turn, so it gets the turn ceiling rather than the driver's short one.
        await chat.sendMessage(message, { readyTimeoutMs: TURN_CEILING_MS })
        // 'ended' is the assistant finished; 'waiting' is it holding the turn open for
        // the person, which is a turn boundary as far as they are concerned.
        handedOver = (await chat.waitForTurn(TURN_CEILING_MS)) === 'waiting'
        // Read first, then replace: a throw from readConversation must not leave the
        // transcript empty.
        const read = await chat.readConversation()
        conversation.length = 0
        conversation.push(...read)
        // Counted only once the turn is reflected in the transcript.
        turns++
      }

      // A judge cannot judge an empty transcript, and a persona that says DONE on its
      // first message produces one while looking like a clean run.
      if (turns === 0 && !error) error = 'no turns completed — the simulated user stopped before saying anything'
      if (conversation.length === 0 && !error) error = 'transcript is empty — messages were sent but readConversation matched nothing, so the chat markup has probably moved'
      // Zero exchanges means the capture missed the path entirely (or the chat never
      // reached the agents service), not that the assistant was idle.
      if (gateway.length === 0 && !error) error = 'no gateway exchanges captured — the chat never reached the agents service, or the capture path changed'
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
    }

    // Outside the try, and overriding whatever else was recorded. A provider failure
    // is never the product's fault — but it does not throw either: the gateway answers
    // 200 and writes the failure into the SSE body, so the turn "completes". Every
    // other symptom is downstream of it, so it names the cause.
    await gatewayErrors.settle()
    if (gatewayErrors.messages.length) {
      error = `provider error from the agents gateway (run is not judgeable): ${gatewayErrors.messages[0]}`
    }

    const transcript: Transcript = {
      case: simCase.name,
      goal: simCase.goal,
      persona: simCase.persona,
      route: simCase.route,
      conversation: withSilentPasses(conversation, silentPasses),
      gateway,
      consoleErrors,
      observations: perception?.observations ?? []
    }
    // `valid` is derived, never hardcoded, so that reportCases says "invalid (…)"
    // instead of re-reporting the previous run's verdict.
    writeEvidence(simCase.name, transcript, {
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
  })
}
