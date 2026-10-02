# Judged agent simulations for portals — design

Date: 2026-10-02 · Branch: `fix-agents-cases`

## Intent

Bring the judged browser simulations of `@data-fair/lib-agents-sim` (already used by
data-fair in `~/data-fair/data-fair/simulations`) into portals, to validate with a
simulated person and a judge:

- **portal navigation** — a visitor using the public portal's own chat;
- **portal manager back-office tasks** — page edition and portal config edition,
  through the data-fair back-office chat driving the manager UI's webmcp tools.

Improvements found while running them are fixed in this branch when their root cause is
in portals and their scope is reasonable. Causes in other repos (agents libs, data-fair
UI shell, data-fair agent-tools package) are **reported only**, with evidence and a
suggested fix. Too-large portals changes are reported, flagged as such.

### Success criteria

- `npm run simulate` runs the six cases below against the dev stack and writes valid
  evidence for each (a valid run, not necessarily a satisfied one).
- The `/agents-sim` skill + `simulation-judge` agent can judge them, and
  `npm run simulate:report` summarises the verdicts.
- A baseline (two Sonnet passes, one Haiku pass) has been run and judged; each friction point has been root-caused and
  either fixed here (one commit per fix, case re-run) or written up in the final report.
- `docs/qa/simulations-assistant-ia.md` summarises the statuses (see QA document).
- Simulations never run from `npm test`, CI, or husky hooks.

### Non-goals

- Upstreaming a generic runner into lib-sim (noted in the report as follow-up).
- Fixing anything outside this repo.
- Narrow-viewport / mobile cases.

## Architecture

Mirrors data-fair's integration, with one runner and a per-case **surface**.

```
playwright.sim.config.ts        separate config; never picked up by npm test
simulations/
  simulate.sim.spec.ts          one test per case, shared turn loop
  cases/index.ts                SimCase[] (SimulationCase + surface + portal fields)
  runner/
    surfaces.ts                 backoffice | portal adapters
    settings.ts                 agents settings → bridge, data-fair agentChat flag
    fixtures.ts                 datasets, portal, pages seeding
    gateway-errors.ts           provider-error detection (copied from data-fair)
  resources/*.csv               dataset fixtures
  report.ts                     reportCases wrapper
  tmp/                          evidence (gitignored)
.claude/skills/agents-sim/      copied by df-agents-sim-init, adapted to portals
.claude/agents/simulation-judge.md
docs/architecture/agent.md      what the judge reads as the product's promises
```

### Tooling

- devDependency `@data-fair/lib-agents-sim@^0.9.0`, plus `@anthropic-ai/claude-agent-sdk`
  and `@modelcontextprotocol/sdk` for the bridge. If the Agent SDK hoists zod 4 and
  breaks type checks, apply the zod override from the lib-sim README.
- Scripts: `simulate` (`playwright test -c playwright.sim.config.ts --project=simulate`),
  `simulate:report`, `dev-bridge` (`df-agents-bridge`, logging to `dev/logs/dev-bridge.log`).
- `BRIDGE_PORT` added to `.env` by `dev/init-env.sh` (next free offset in the random
  range), so each worktree has its own bridge. The current worktree's `.env` gets it
  added by hand.
- `.zellij.kdl` gets a `bridge` pane; `dev/scripts/status.sh` reports the bridge as
  optional (`/_bridge/status`). The maintainer starts it; agents never do.
- `playwright.sim.config.ts`: `workers: 1`, timeout 45 min, headed unless
  `SIM_HEADLESS=1`, `trace: 'on'`, action/navigation timeouts 30s, viewport 1920×1080,
  `state-setup`/`state-teardown` projects reused from `tests/`.

### Seeding (fresh on every run)

Owner: organization `test_org1`, acting user `test_admin` (org admin). Superadmin
writes go through `test_superadmin`. Everything is `test_`-owned so the test cleanup
endpoint and data-fair dataset deletion reset it.

1. `clean()` (portals test-env) and deletion of the fixed-id simulation datasets.
2. Datasets in data-fair, fixed ids prefixed `sim-`, from CSVs in
   `simulations/resources` (a sports facilities dataset with a capacity column, and a
   second unrelated one so search has something to discriminate), published on the
   seeded portal's publication site; wait for indexing.
3. Agents settings (superadmin body + org body, credit cap lifted) mapping every role
   to the bridge: assistant `SIM_ASSISTANT_MODEL` (default `sonnet`), background roles
   `SIM_TOOLS_MODEL` (default `haiku`). Quotas unlimited for every role including
   `anonymous`, so portal visitors can chat.
4. data-fair setting `agentChat: true` for the owner (back-office drawer).
5. One portal, with `agentChat: { active: true, visibleTo: ['anonymous'] }`, a few
   topics, a home page, a dataset catalog, an existing content page, and a menu. Its
   draft is also its published config so both surfaces see the same thing.

`assertBridgeUp()` runs first and fails with an actionable message.

### Surfaces

Each case carries `surface: 'backoffice' | 'portal'`. An adapter provides:

| | backoffice | portal |
|---|---|---|
| reach | log in as `test_admin` (org `test_org1`), goto the case route under `/data-fair/...` | anonymous goto `portalUrl(portalId) + route` |
| chat frame | `iframe[src*="/agents/"][src*="/chat"]` in the data-fair shell | the portal's own chat drawer iframe |
| open chat | probe the composer, else click `.df-agent-chat-toggle` — before every send | same mechanism, portal toggle |
| perception roots | `page` (shell + nested manager iframe) with a larger cap, and the chat panel | `page` and the chat panel |

Locale `fr` on both. Off-limits for the persona: composer input, send, stop, reset.

### Turn loop

Copied from data-fair's `simulate.sim.spec.ts` and kept equivalent: pessimistic sidecar
written first, wait handover (`waitForTurn` → `'waiting'`), empty-completion and
empty-transcript guards, zero-gateway guard, provider error overrides validity,
`TURN_CEILING_MS` 5 min, models recorded in the sidecar.

## Cases (all `fr`)

Back-office (persona: a communication officer of a small local authority who manages
the portal, not technical):

1. **page-settings** — on the page editor of the seeded content page: attach it to a
   topic and adjust its title/description. (The original timeout report was this.)
2. **page-content** — on the same page: add a text introduction then a list of the
   portal's datasets; wants to see it on screen before saving.
3. **portal-config** — on the portal's edition page: change the main colour and add a
   menu entry to an existing page.
4. **page-then-menu** — starting from the pages list: create a new page and get it into
   the portal menu. Crosses from the pages manager to the portal manager (frame change).

Portal visitor (persona: a resident, not technical, on the public portal):

5. **portal-find-and-filter** — from the home page: wants a link to the list of sports
   facilities over a capacity threshold, opens it to check it shows the right rows.
6. **portal-data-question** — from the dataset page: asks a factual question that
   requires querying the data, wants it shown on screen not just recopied in the chat.

Exact routes/wording are settled in implementation against what the seeded data and
pages expose; goals stay achievable with existing tools (a goal no tool can satisfy
measures a missing capability, not the experience).

## Judge material

`docs/architecture/agent.md`: frame topology (data-fair shell → manager UI iframe →
chat drawer; portal → its own chat), the manager's webmcp tools (`pageConfig_*`,
portal config tools, `useFrameServer`), the portal's agent tools and prompt context, and
the `_c_` filter constraint. The judge's definition is pointed at it.

## Iteration

1. Get every case to a valid run (harness issues are fixed in `simulations/`).
2. Run the baseline, judge each valid case, `simulate:report`.
3. Root-cause each friction point in the code: portals defect → fix + re-run the case;
   other repo → report; harness artefact → fix the harness.
4. Final report: verdicts before/after, fixes made, cross-repo findings — written as the
   QA document below.

## QA document

`docs/qa/simulations-assistant-ia.md`, in French, same structure and tone as
data-fair's `docs/qa/simulations-assistant-ia.md`:

- **Titre + état au <date>**, the branch measured and the exact dependency versions
  (`agents:main` image commit, `data-fair:master` image, `@data-fair/lib-agents-sim`,
  `lib-vue-agents` / `lib-vuetify-agents`, vjsf).
- **En bref** — satisfied/total per assistant model, what holds, what is fragile,
  cases failing by construction.
- **Résultats de la référence** — one row per case (case, what the person wants),
  one column per pass (two Sonnet passes, one Haiku pass), ✓/✗ with the judge's
  friction count; then why each failure happened.
- **Ce que la référence a fait corriger** — finding / fix / where (portals, or the
  other repo for reported-only findings, marked as not fixed here).
- **Limites et prochaines étapes** — open issues, coverage gaps, cadence.
- **Fonctionnement** — short description of persona/assistant/judge, invalid runs,
  and how to launch (`/agents-sim`), out of `npm test` and CI.

It records statuses only from runs actually judged; no row is filled from an invalid or
unjudged run. The `/agents-sim` skill's last step is extended to update it after a
baseline.

Commits follow `dev/COMMITS.md`. A `simulations` scope is added to the commitlint
`scope-enum` and the COMMITS.md table (as data-fair has); the scaffold is
`feat(simulations): …`, each product fix its own commit with its editorial scope
(`ui`, `portal`, `page-element`, …).

## Testing

Unit test (existing `unit` project) for the pure helpers: `errorsInSseBody` /
`errorsInResponse` and the agents settings builder. Lint and type checks cover the rest.
