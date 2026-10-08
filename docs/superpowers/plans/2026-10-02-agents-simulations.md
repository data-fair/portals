# Judged agent simulations for portals — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run judged browser simulations (`@data-fair/lib-agents-sim`) of the portal visitor chat and of portal-manager back-office tasks, fix the portals-side frictions they reveal, and publish a QA summary.

**Architecture:** A separate Playwright config (`playwright.sim.config.ts`) runs `simulations/simulate.sim.spec.ts`: one test per case, a shared turn loop copied from data-fair, and a per-case `surface` adapter (`backoffice` = data-fair shell embedding the manager UI; `portal` = public Nuxt portal with its own chat). Seeding is fresh per run (`test_`-owned). Evidence lands in `simulations/tmp/`, is judged by the `simulation-judge` sub-agent, and is summarised by `simulations/report.ts` and `docs/qa/simulations-assistant-ia.md`.

**Tech Stack:** Playwright, `@data-fair/lib-agents-sim` 0.9, Claude Code bridge (`df-agents-bridge`), agents service (`ghcr.io/data-fair/agents:main`), data-fair (`ghcr.io/data-fair/data-fair:master`), Vue/Vuetify manager UI, Nuxt portal.

**Spec:** `docs/superpowers/specs/2026-10-02-agents-simulations-design.md`

**Reference implementation:** `~/data-fair/data-fair/simulations/`, `~/data-fair/data-fair/playwright.sim.config.ts`, `~/data-fair/data-fair/.claude/skills/agents-sim/SKILL.md`, `~/data-fair/data-fair/docs/qa/simulations-assistant-ia.md`. Read them; copy behaviour, not repo-specific values.

## Global Constraints

- Never start, stop or restart dev processes (including the bridge). Ask the user. Check with `bash dev/scripts/status.sh`.
- Simulations never run from `npm test`, CI or husky hooks: only `playwright.sim.config.ts` matches `*.sim.spec.ts`.
- Every seeded resource is owned by `test_org1` (or uses a `sim-` fixed id in data-fair) so cleanup resets it; acting admin `test_admin@test.com`, superadmin `test_superadmin@test.com`, password `passwd`.
- Locale `fr` for every case and for the chat driver.
- Models: `SIM_ASSISTANT_MODEL` default `sonnet`, `SIM_TOOLS_MODEL` default `haiku`, user model from `resolveUserModel()` (lib default). Recorded in every sidecar.
- `TURN_CEILING_MS = 5 * 60 * 1000`; config timeout 45 min; `workers: 1`; viewport 1920×1080; headed unless `SIM_HEADLESS=1`; `trace: 'on'`.
- Root causes outside portals (agents libs, data-fair UI/agent tools, lib-sim) are reported, never fixed here.
- Commits follow `dev/COMMITS.md`; new scope `simulations`; each product fix its own commit with its editorial scope. Never amend/rebase pushed commits.
- Sandboxed Bash is broken on this machine: run commands with the sandbox disabled.
- Run only related tests while iterating (`npm run test -- <file>`), plus `npm run lint` and `npm run check-types` before each commit.

## Review Focus

1. **Bridge down or not configured** — `assertBridgeUp()` fails the case within seconds with "Ask your user to start it with: npm run dev-bridge", and an invalid sidecar is written (pinned in Task 4 via the runner's setup-inside-try; verified manually in Task 4 Step 6).
2. **Anonymous portal visitor cannot see the chat** (known skipped test) — portal cases must not silently degrade into "no gateway exchange"; Task 3 fixes or documents it, and the zero-gateway guard (Task 4) turns it into an invalid run with a clear error.
3. **Provider error inside a 200 SSE body or a 429** — must invalidate the run, not be judged (unit-tested in Task 2).
4. **Persona navigates away / closes the drawer** — `ensureChatOpen` reopens before every send on both surfaces (Task 4).
5. **Stale evidence from an earlier run** — pessimistic sidecar written before setup (Task 4) and the skill deletes `simulations/tmp/sim-*` first (Task 5).

---

## File Structure

| Path | Responsibility |
|---|---|
| `package.json` | scripts `simulate`, `simulate:report`, `dev-bridge`; devDeps lib-agents-sim, agent SDK, MCP SDK |
| `dev/init-env.sh`, `.env` | `BRIDGE_PORT` |
| `.zellij.kdl` | `bridge` pane |
| `dev/scripts/status.sh` | `dev-bridge (opt)` line |
| `commitlint.config.ts`, `dev/COMMITS.md` | `simulations` scope |
| `.gitignore` | `/simulations/tmp/` |
| `playwright.sim.config.ts` | simulation-only Playwright config |
| `simulations/runner/gateway-errors.ts` | provider-error detection in gateway responses |
| `simulations/runner/settings.ts` | agents settings → bridge, data-fair `agentChat`, `assertBridgeUp` |
| `simulations/runner/fixtures.ts` | datasets, portal, topics, pages seeding |
| `simulations/runner/surfaces.ts` | `backoffice` / `portal` adapters |
| `simulations/cases/index.ts` | the six cases |
| `simulations/simulate.sim.spec.ts` | turn loop + evidence |
| `simulations/report.ts` | `reportCases` wrapper |
| `simulations/resources/*.csv` | dataset fixtures |
| `tests/features/simulations/runner.unit.spec.ts` | unit tests of the pure helpers |
| `.claude/skills/agents-sim/SKILL.md`, `.claude/agents/simulation-judge.md` | copied by `df-agents-sim-init`, adapted |
| `docs/architecture/agent.md` | product promises the judge reads |
| `AGENTS.md` | Simulations section |
| `docs/qa/simulations-assistant-ia.md` | QA summary (French) |

---

### Task 1: Tooling — dependencies, bridge process, scope

**Files:**
- Modify: `package.json`, `package-lock.json`, `dev/init-env.sh`, `.env`, `.zellij.kdl`, `dev/scripts/status.sh`, `commitlint.config.ts`, `dev/COMMITS.md`, `.gitignore`

**Interfaces:**
- Produces: env var `BRIDGE_PORT`; npm scripts `dev-bridge`, `simulate`, `simulate:report`; commit scope `simulations`.

- [ ] **Step 1: Install dev dependencies**

```bash
npm i -D @data-fair/lib-agents-sim@^0.9.0 @anthropic-ai/claude-agent-sdk@^0.3.270 @modelcontextprotocol/sdk@^1.30.0
```

Then `npm run check-types`. If it fails with zod inference errors in `ai`-related types, add to root `package.json`:

```json
"overrides": { "@anthropic-ai/claude-agent-sdk": { "zod": "3.25.76" } }
```

and re-run `npm install` + `npm run check-types`.

- [ ] **Step 2: Add scripts to root `package.json`**

```json
"dev-bridge": "mkdir -p dev/logs && dotenv -- df-agents-bridge 2>&1 | tee dev/logs/dev-bridge.log",
"simulate": "playwright test -c playwright.sim.config.ts --project=simulate",
"simulate:report": "dotenv -- node --experimental-strip-types --disable-warning=ExperimentalWarning simulations/report.ts",
```

- [ ] **Step 3: `BRIDGE_PORT`**

In `dev/init-env.sh`, after `AGENTS_PORT=$((RANDOM_NB + 34))`:

```bash
BRIDGE_PORT=$((RANDOM_NB + 38))
```

In this worktree's `.env` (base port 22744), append `BRIDGE_PORT=22782`.

- [ ] **Step 4: zellij pane** — in `.zellij.kdl`, inside the first `pane { split_direction "vertical" ... }`, after the `mock ingress manager` pane:

```kdl
      pane name="bridge" {
        command "bash"
        args "-ic" "nvm use > /dev/null 2>&1 && npm run dev-bridge"
      }
```

- [ ] **Step 5: status line** — in `dev/scripts/status.sh`, after `check_http "ingress-manager" ...`:

```bash
# Optional: only needed for simulations (npm run simulate).
if [ -n "${BRIDGE_PORT:-}" ]; then
  check_http "dev-bridge (opt)" "http://localhost:${BRIDGE_PORT}/_bridge/status"
else
  printf "%-20s n/a      (BRIDGE_PORT missing from .env — see dev/init-env.sh)\n" "dev-bridge (opt)"
fi
```

- [ ] **Step 6: scope + gitignore** — add `'simulations',` to the `scope-enum` array in `commitlint.config.ts`; add a row `| \`simulations\` | Judged agent simulations (\`simulations/\`, sim config, agents-sim skill, QA doc) |` to the scopes table in `dev/COMMITS.md`; add `/simulations/tmp/` to `.gitignore`.

- [ ] **Step 7: Verify**

Run: `bash dev/scripts/status.sh | grep bridge` → Expected: `dev-bridge (opt)  DOWN ...` (bridge not started yet — that is correct).
Run: `node -e "import('@data-fair/lib-agents-sim').then(m => console.log(Object.keys(m).length > 5))" && node -e "import('@anthropic-ai/claude-agent-sdk').then(() => console.log('sdk ok'))"` → Expected: `true` then `sdk ok`. (Do not launch `df-agents-bridge` itself: starting the bridge is the user's job.)
Run: `npm run lint && npm run check-types` → PASS.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json dev/init-env.sh .zellij.kdl dev/scripts/status.sh commitlint.config.ts dev/COMMITS.md .gitignore
git commit -m "chore(simulations): add the agents-sim tooling and a per-worktree Claude Code bridge"
```

(`.env` is not tracked; do not add it.)

Then tell the user: "Please start the bridge (new `bridge` zellij pane, or `npm run dev-bridge`) — Task 4 needs it."

---

### Task 2: Pure runner helpers (TDD)

**Files:**
- Create: `simulations/runner/gateway-errors.ts`, `simulations/runner/settings.ts`
- Test: `tests/features/simulations/runner.unit.spec.ts`

**Interfaces:**
- Produces:
  - `errorsInSseBody(body: string): string[]`, `errorsInResponse(status: number, body: string): string[]`, `captureGatewayErrors(page: Page): { messages: string[], settle(): Promise<void> }`
  - `OWNER = { type: 'organization', id: 'test_org1' }`, `OWNER_ADMIN_EMAIL = 'test_admin@test.com'`, `MODEL_ROLES`, `bridgeSettings(assistantModelId: string, toolsModelId: string): { superadmin, org }`, `BRIDGE_URL: string`, `assertBridgeUp(): Promise<void>`, `seedSettings(assistantModelId: string, toolsModelId: string): Promise<void>`

- [ ] **Step 1: Write the failing tests**

`tests/features/simulations/runner.unit.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { errorsInSseBody, errorsInResponse } from '../../../simulations/runner/gateway-errors.ts'
import { bridgeSettings, MODEL_ROLES } from '../../../simulations/runner/settings.ts'

test.describe('simulation runner helpers', () => {
  test('errorsInSseBody keeps only error chunks', () => {
    const body = [
      'data: {"choices":[{"delta":{"content":"Bonjour"}}]}',
      'data: not json',
      'data: {"error":{"message":"rate limited"}}',
      'data: [DONE]'
    ].join('\n')
    expect(errorsInSseBody(body)).toEqual(['rate limited'])
  })

  test('errorsInResponse reads a quota refusal', () => {
    expect(errorsInResponse(429, '{"reason":"credits exhausted"}')).toEqual(['HTTP 429: credits exhausted'])
    expect(errorsInResponse(500, 'oops')).toEqual(['HTTP 500'])
    expect(errorsInResponse(200, 'data: {"choices":[]}')).toEqual([])
  })

  test('bridgeSettings maps background roles to the tools model', () => {
    const { superadmin, org } = bridgeSettings('sonnet', 'haiku')
    expect(Object.keys(org.modelMapping).sort()).toEqual([...MODEL_ROLES].sort())
    expect(org.modelMapping.assistant.id).toBe('sonnet')
    expect(org.modelMapping.evaluator.id).toBe('sonnet')
    expect(org.modelMapping.tools.id).toBe('haiku')
    expect(org.modelMapping.summarizer.id).toBe('haiku')
    expect(org.modelMapping.moderator.id).toBe('haiku')
    expect(superadmin.models.map(m => m.model.id).sort()).toEqual(['haiku', 'sonnet'])
    // portal visitors are anonymous: their quota must not be 0/limited
    expect(org.quotas.anonymous.unlimited).toBe(true)
    expect(superadmin.providers[0].compatibility).toBe('compatible')
  })

  test('bridgeSettings with one model declares it once', () => {
    const { superadmin } = bridgeSettings('sonnet', 'sonnet')
    expect(superadmin.models).toHaveLength(1)
    expect(superadmin.models[0].usage.sort()).toEqual([...MODEL_ROLES].sort())
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- tests/features/simulations/runner.unit.spec.ts`
Expected: FAIL — cannot resolve `simulations/runner/gateway-errors.ts`.

- [ ] **Step 3: Implement `simulations/runner/gateway-errors.ts`**

Copy `~/data-fair/data-fair/simulations/runner/gateway-errors.ts` verbatim (its header comment explains why it reads the gateway protocol, not the screen). It exports exactly the three functions above.

- [ ] **Step 4: Implement `simulations/runner/settings.ts`**

```ts
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
 * Roles a deployment puts on a small model. Running them on the assistant's model
 * would flatter the product. The evaluator reviews traces no run exercises, so it
 * follows the assistant.
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

/** Agents settings (superadmin body, then org body validated against it), credit cap lifted, data-fair chat on. */
export async function seedSettings (assistantModelId: string, toolsModelId: string) {
  const admin = await axiosAuth({ email: SUPER_ADMIN_EMAIL, adminMode: true })
  const { superadmin, org } = bridgeSettings(assistantModelId, toolsModelId)
  await admin.put(`${ROOT}/agents/api/settings/${OWNER.type}/${OWNER.id}`, superadmin)
  await admin.put(`${ROOT}/agents/api/settings/${OWNER.type}/${OWNER.id}/org`, org)
  // A production-mode image defaults the credit cap to 0 (every request 429). -1 lifts it.
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
```

Check `axiosAuth`'s option names against `@data-fair/lib-node/axios-auth.js` (`AxiosAuthOptions`): use the actual names for org and admin mode (e.g. `org`, `adminMode`); adjust the two calls if they differ. `tests/support/axios.ts` has no side effect at import, so the unit test can import this module.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test -- tests/features/simulations/runner.unit.spec.ts`
Expected: 4 passed.

- [ ] **Step 6: Lint, types, commit**

```bash
npm run lint && npm run check-types
git add simulations/runner/gateway-errors.ts simulations/runner/settings.ts tests/features/simulations/runner.unit.spec.ts
git commit -m "feat(simulations): bridge settings and provider-error detection for simulation runs"
```

If `check-types` does not cover `simulations/` (root `tsconfig.json` `include`), add `"simulations/**/*.ts"` and `"playwright.sim.config.ts"` to it in this commit.

---

### Task 3: Anonymous visitors see the portal chat

The portal cases need an anonymous visitor to see the chat; `tests/features/portal-rendering/agent-chat-visibility.e2e.spec.ts` has this exact test skipped with "TODO: the agent chat toggle never renders for anonymous visitors even when `visibleTo: ['anonymous']`".

**Files:**
- Test: `tests/features/portal-rendering/agent-chat-visibility.e2e.spec.ts` (un-skip)
- Modify: the root cause, starting from `portal/app/components/agent-chat.vue` (`v-if="agentChat?.active && canSee && owner"`, `viewerBucket`, `canSee`) and wherever it is mounted.

- [ ] **Step 1: Un-skip the test** — replace `test.skip(` with `test(` for "anonymous visitor sees the toggle when visibleTo includes anonymous" and delete the TODO comment above it.

- [ ] **Step 2: Run it to see the failure**

Run: `npm run test -- tests/features/portal-rendering/agent-chat-visibility.e2e.spec.ts`
Expected: FAIL on `.df-agent-chat-toggle` visibility.

- [ ] **Step 3: Root-cause with superpowers:systematic-debugging.** Hypotheses to check in order, each with evidence (SSR HTML via `curl`, browser console, Vue state):
  1. `session.state.user` undefined vs not-yet-loaded on SSR → `viewerBucket` mismatch between server and client (hydration drops the subtree).
  2. The component's parent only mounts it for logged-in sessions (grep for `<agent-chat` in `portal/app`).
  3. `owner` prop is missing for anonymous (owner fetched from an authenticated endpoint).
  4. The agents service refuses anonymous sessions (`/agents/...` 401/403) and the lib hides the toggle.
  If the cause is in the agents service or libs (hypothesis 4), stop: record it for the final report, keep the test skipped with an updated TODO naming the cause, and switch the portal surface to a logged-in visitor with no role in `test_org1` (`test_alone@test.com`, bucket `external`; set `visibleTo: ['anonymous', 'external']` in the seeded portal). Note that decision in the commit message.

- [ ] **Step 4: Fix minimally in portals, re-run**

Run: `npm run test -- tests/features/portal-rendering/agent-chat-visibility.e2e.spec.ts`
Expected: all tests in the file pass (the anonymous one included).

- [ ] **Step 5: Lint, types, commit**

```bash
npm run lint && npm run check-types
git add -A portal tests/features/portal-rendering/agent-chat-visibility.e2e.spec.ts
git commit -m "fix(portal): <what was wrong>, so anonymous visitors see the agent chat"
```

---

### Task 4: Seeding, surfaces, runner and the six cases

**Files:**
- Create: `playwright.sim.config.ts`, `simulations/runner/fixtures.ts`, `simulations/runner/surfaces.ts`, `simulations/cases/index.ts`, `simulations/simulate.sim.spec.ts`, `simulations/report.ts`, `simulations/resources/equipements-sportifs.csv`, `simulations/resources/suivi-demandes.csv`

**Interfaces:**
- Consumes (Task 2): `OWNER`, `OWNER_ADMIN_EMAIL`, `seedSettings`, `assertBridgeUp`, `captureGatewayErrors`.
- Produces:
  - `type SimCase = SimulationCase & { surface: 'backoffice' | 'portal' }` where `route` is relative: back-office routes start with `/data-fair/`, portal routes are paths on the portal domain; the token `{portalId}`, `{pageId}` in a route is replaced by seeded ids.
  - `seedAll(): Promise<SeedIds>` with `type SeedIds = { portalId: string, pageId: string, datasetIds: string[] }`
  - `resolveRoute(route: string, ids: SeedIds): string`
  - `createSurface(simCase: SimCase, page: Page, ids: SeedIds): Surface` with `type Surface = { goto(): Promise<void>, chatFrame: FrameLocator, ensureChatOpen(composer: Locator): Promise<void>, perceptionRoots: Array<{ label: string, root: Page | FrameLocator, cap?: number }> }`

- [ ] **Step 1: `playwright.sim.config.ts`**

Copy `~/data-fair/data-fair/playwright.sim.config.ts` (keep its comments) with these changes: `baseURL: \`http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}\`` (no path suffix: back-office routes carry `/data-fair/`, portal routes are absolute URLs built by the surface); the 1920×1080 comment reworded for portals ("the chat drawer is temporary below xl and its scrim would block the page").

- [ ] **Step 2: Resources** — copy `~/data-fair/data-fair/simulations/resources/equipements-sportifs.csv` and `suivi-demandes.csv`. Read the first one: note its capacity column name and the real count of facilities over 500 places (the portal cases rely on it; write the count in a comment in `cases/index.ts`).

- [ ] **Step 3: `simulations/runner/fixtures.ts`**

```ts
/**
 * What a case's person finds: two indexed datasets published on one portal, the
 * portal itself with topics, a menu and pages. Seeded fresh on every run after the
 * cleanups, so a case never inherits another run's state.
 */
import FormData from 'form-data'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { axiosAuth, clean } from '../../tests/support/axios.ts'
import { OWNER, OWNER_ADMIN_EMAIL } from './settings.ts'

const ROOT = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
const resourcesDir = path.join(process.cwd(), 'simulations', 'resources')

export type SeedIds = { portalId: string, pageId: string, datasetIds: string[] }

const DATASETS = [
  { id: 'sim-equipements-sportifs', file: 'equipements-sportifs.csv', title: 'Équipements sportifs', description: 'Recensement des équipements sportifs de l\'agglomération : gymnases, piscines, stades et salles.', topic: 'sport' },
  { id: 'sim-suivi-demandes', file: 'suivi-demandes.csv', title: 'Suivi des demandes citoyennes', description: 'Demandes adressées aux services de la collectivité et leur état d\'avancement.', topic: 'citoyennete' }
]

const TOPICS = [
  { id: 'sport', title: 'Sport et loisirs', color: '#2e7d32' },
  { id: 'citoyennete', title: 'Citoyenneté', color: '#1565c0' },
  { id: 'education', title: 'Education, social, santé', color: '#ad1457' }
]

export async function seedAll (): Promise<SeedIds> {
  await clean()
  const ax = await axiosAuth({ email: OWNER_ADMIN_EMAIL, org: OWNER.id })
  for (const d of DATASETS) await ax.delete(`${ROOT}/data-fair/api/v1/datasets/${d.id}`).catch(() => {})

  const portal = (await ax.post('/api/portals', {
    config: {
      title: 'Portail de l\'agglomération',
      topics: TOPICS,
      menu: { children: [] },
      agentChat: { active: true, visibleTo: ['anonymous', 'external', 'user', 'contrib', 'admin'] }
    }
  })).data
  const portalId: string = portal._id
  const site = `data-fair-portals:${portalId}`

  for (const d of DATASETS) {
    const form = new FormData()
    form.append('file', readFileSync(path.join(resourcesDir, d.file)), { filename: d.file, contentType: 'text/csv' })
    form.append('body', JSON.stringify({ title: d.title, description: d.description }))
    await ax.put(`${ROOT}/data-fair/api/v1/datasets/${d.id}`, form, {
      headers: { 'Content-Length': form.getLengthSync(), ...form.getHeaders() }
    })
  }
  await waitForDatasets(ax, DATASETS.map(d => d.id))
  for (const d of DATASETS) {
    await ax.patch(`${ROOT}/data-fair/api/v1/datasets/${d.id}`, { publicationSites: [site], topics: [TOPICS.find(t => t.id === d.topic)] })
    await ax.put(`${ROOT}/data-fair/api/v1/datasets/${d.id}/permissions`, [{ classes: ['read', 'list'] }])
  }

  const home = { type: 'home', config: { title: 'Accueil', elements: [{ type: 'title', content: 'Les données de l\'agglomération', titleSize: 'h2' }, { type: 'datasets-list', limit: 6 }] }, portals: [portalId], owner: portal.owner }
  const catalog = { type: 'datasets', config: { title: 'Données', elements: [{ uuid: 'cat1', type: 'datasets-catalog', columns: 3, filters: { items: ['search'] } }] }, portals: [portalId], owner: portal.owner }
  const content = { type: 'generic', config: { title: 'Nos actions pour la jeunesse', elements: [{ type: 'text', content: 'Cette page présente les actions de la collectivité pour les jeunes.' }] }, portals: [portalId], owner: portal.owner }
  await ax.post('/api/pages', home)
  await ax.post('/api/pages', catalog)
  const pageId: string = (await ax.post('/api/pages', content)).data._id

  await ax.patch(`/api/portals/${portalId}`, { config: { ...portal.config, menu: { children: [{ type: 'standard', subtype: 'datasets', title: 'Données' }] } } })
  return { portalId, pageId, datasetIds: DATASETS.map(d => d.id) }
}

/** Indexing is asynchronous; asking about an unfinalized dataset measures nothing. */
async function waitForDatasets (ax: any, ids: string[]) {
  const deadline = Date.now() + 120_000
  for (const id of ids) {
    while (true) {
      const status = (await ax.get(`${ROOT}/data-fair/api/v1/datasets/${id}`)).data.status
      if (status === 'finalized') break
      if (status === 'error') throw new Error(`dataset ${id} failed to index`)
      if (Date.now() > deadline) throw new Error(`dataset ${id} still "${status}" after 120s`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
```

Before running, verify every config shape against the schemas and adjust: page types and element types (`api/types/page/`, `api/types/page-elements/schema.js` — e.g. the real name of a datasets list element, the `generic` page type, the text element field), the portal `topics` and `menu` item shapes (`api/types/portal-config/schema.ts`), whether a portal needs a draft→publish step to be served (see how `tests/support/cards.ts` / portal e2e tests make a portal reachable via `portalUrl()`), and whether `PATCH /api/portals/:id` takes `config` or `draftConfig`. The comparison point for a working seeding is `createCardPortal` in `tests/support/cards.ts`.

- [ ] **Step 4: Verify seeding alone**

```bash
npx dotenv -- node --experimental-strip-types --disable-warning=ExperimentalWarning -e "import('./simulations/runner/fixtures.ts').then(m => m.seedAll()).then(ids => console.log(ids))"
```

Expected: `{ portalId: '...', pageId: '...', datasetIds: [...] }`. Then open `http://<portalId>.portals.fix-agents-cases.localhost:22744/` with `curl -s ... | grep -o "Les données de l'agglomération"` → Expected: a match; and `curl -s ".../data-fair/api/v1/datasets?publicationSites=data-fair-portals:<portalId>" | jq .count` → `2`.

- [ ] **Step 5: `simulations/runner/surfaces.ts`**

```ts
/**
 * Where a case happens and how its chat is reached. The turn loop is the same on
 * both surfaces; only reaching the page, finding the chat and what the person can
 * see differ.
 *
 * backoffice — the data-fair back-office shell (data-fair image) embeds the manager
 *   UI (this repo's dev server) in a d-frame; the chat drawer belongs to the shell
 *   and the tools are registered by the manager UI inside the frame. That is the
 *   production topology, iframe changes included.
 * portal — the public Nuxt portal renders its own chat drawer.
 */
import type { FrameLocator, Locator, Page } from '@playwright/test'
import type { SimulationCase } from '@data-fair/lib-agents-sim'
import type { SeedIds } from './fixtures.ts'
import { OWNER, OWNER_ADMIN_EMAIL } from './settings.ts'

export type SimCase = SimulationCase & { surface: 'backoffice' | 'portal' }

export type Surface = {
  goto: () => Promise<void>
  chatFrame: FrameLocator
  ensureChatOpen: (composer: Locator) => Promise<void>
  perceptionRoots: Array<{ label: string, root: Page | FrameLocator, cap?: number }>
}

const ROOT = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
/** The agents chat frame, whose src is /agents/<type>/<id>/chat?… — not a bare 'iframe': both surfaces embed other frames. */
const CHAT_FRAME = 'iframe[src*="/agents/"][src*="/chat"]'

export function resolveRoute (route: string, ids: SeedIds) {
  return route.replaceAll('{portalId}', ids.portalId).replaceAll('{pageId}', ids.pageId)
}

export function portalUrl (portalId: string) {
  return `http://${portalId}.portals.${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
}

async function login (page: Page, target: string) {
  await page.goto(`${ROOT}/simple-directory/login?redirect=${encodeURIComponent(target)}&org=${OWNER.id}`)
  await page.getByLabel('Adresse mail').fill(OWNER_ADMIN_EMAIL)
  await page.getByRole('textbox', { name: 'Mot de passe' }).fill('passwd')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL(url => url.toString().startsWith(target.split('?')[0]), { timeout: 30_000 })
}

export function createSurface (simCase: SimCase, page: Page, ids: SeedIds): Surface {
  const chatFrame = page.frameLocator(CHAT_FRAME)
  /**
   * The drawer does not survive a full navigation, and the persona may close it.
   * Reopening before every send keeps the run alive so the friction reaches the
   * transcript instead of killing it. Probe first: clicking unconditionally would
   * close a drawer that is already open.
   */
  const ensureChatOpen = async (composer: Locator) => {
    const open = await composer.waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false)
    if (open) return
    await page.locator('.df-agent-chat-toggle').first().click()
    await composer.waitFor({ state: 'visible', timeout: 30_000 })
  }
  const route = resolveRoute(simCase.route, ids)

  if (simCase.surface === 'backoffice') {
    return {
      goto: () => login(page, `${ROOT}${route}`),
      chatFrame,
      ensureChatOpen,
      // The shell page includes the manager frame's content in its accessibility
      // outline; the manager forms are long, hence the larger cap.
      perceptionRoots: [{ label: 'page', root: page, cap: 8000 }, { label: 'chat panel', root: chatFrame }]
    }
  }
  return {
    goto: async () => { await page.goto(portalUrl(ids.portalId) + route, { waitUntil: 'domcontentloaded' }) },
    chatFrame,
    ensureChatOpen,
    perceptionRoots: [{ label: 'page', root: page, cap: 6000 }, { label: 'chat panel', root: chatFrame }]
  }
}
```

If Task 3 switched the portal surface to a logged-in `external` visitor, the portal `goto` logs in as `test_alone@test.com` without `org=` (reuse `login` with an email parameter). Check the simple-directory login query parameter for the org (`org=`) against an existing login URL in the dev stack; drop it if the data-fair shell selects the account another way (the account switcher).

- [ ] **Step 6: `simulations/simulate.sim.spec.ts`**

Copy `~/data-fair/data-fair/simulations/simulate.sim.spec.ts` and keep every comment that still applies. Changes:

```ts
import { test } from '@playwright/test'
import { cases } from './cases/index.ts'
import { seedAll } from './runner/fixtures.ts'
import { assertBridgeUp, seedSettings } from './runner/settings.ts'
import { captureGatewayErrors } from './runner/gateway-errors.ts'
import { createSurface } from './runner/surfaces.ts'
import {
  createChatDriver, chatDriverStrings, captureGateway,
  nextUserMessage, isDone, resolveUserModel,
  writeEvidence, type Transcript, selectCases, createPagePerception
} from '@data-fair/lib-agents-sim'
```

Inside the test (signature `async ({ page }) =>`), the setup block becomes:

```ts
      await assertBridgeUp()
      const ids = await seedAll()
      await seedSettings(ASSISTANT_MODEL, TOOLS_MODEL)
      if (process.env.SIM_SUB_AGENTS === '0') { /* same cookie as data-fair, url `${ROOT}/agents` */ }
      const surface = createSurface(simCase, page, ids)
      await surface.goto()
      const root = surface.chatFrame
      const locale = 'fr' as const
      const strings = chatDriverStrings(locale)
      const composer = root.getByPlaceholder(strings.input)
      const ensureChatOpen = () => surface.ensureChatOpen(composer)
      await ensureChatOpen()
      const chat = createChatDriver(root, { locale })
      perception = createPagePerception(surface.perceptionRoots, { offLimits: [strings.input, strings.send, strings.stop, strings.reset] })
```

Everything else — pessimistic sidecar first, the handover loop, empty-completion / empty-transcript / zero-gateway guards, `gatewayErrors.settle()` override, final `writeEvidence` and `throw` on invalid — is kept as in data-fair. Add `surface: simCase.surface` nowhere in the transcript type (the case name identifies it); keep the `Transcript` shape from the lib.

- [ ] **Step 7: `simulations/cases/index.ts`**

```ts
/**
 * What a case is: a surface, a page, a person, and something they want. There is
 * deliberately NO expected result — a run is judged by reading its transcript.
 * A goal must be reachable with tools that exist; one no tool can satisfy measures
 * a missing capability, not the experience.
 *
 * Route tokens: {portalId}, {pageId} are replaced with the ids seeded for the run.
 */
import type { SimCase } from '../runner/surfaces.ts'

const MANAGER = 'Tu es chargé de communication dans une petite collectivité. Tu gères le portail de données de la collectivité, mais tu n\'es pas informaticien : tu ne sais pas ce qu\'est un schéma, un composant ou un JSON, et tu n\'emploieras jamais ces mots. Si on te dit que c\'est fait sans que tu voies quoi que ce soit à l\'écran, tu le dis. Tu ne prétends jamais avoir cliqué sur un bouton sans l\'avoir fait.'

const RESIDENT = 'Tu es un habitant de l\'agglomération, curieux mais pas informaticien : tu ne sais pas ce qu\'est un jeu de données, un filtre ou une API, et tu n\'emploieras jamais ces mots. Tu es sur le site de données de ta collectivité. Si une réponse est vague, ou si on te dit que c\'est fait sans que tu voies quoi que ce soit à l\'écran, tu le dis.'

export const cases: SimCase[] = [
  // The original report: "Rattache cette page à la thématique Education, social, santé"
  // timed out (MCP -32001) after stale frame tools. Page settings through pageConfig_*.
  {
    name: 'page-parametres',
    surface: 'backoffice',
    route: '/data-fair/pages/{pageId}/edit-config',
    persona: MANAGER,
    goal: 'Tu veux que la page « Nos actions pour la jeunesse » soit rattachée à la thématique « Education, social, santé », et que sa description dise en une phrase qu\'elle présente les dispositifs pour les 16-25 ans. Tu veux voir le changement à l\'écran avant qu\'il soit enregistré.',
    maxTurns: 6
  },
  // Page content: the 38-type oneOf form and its subagent.
  {
    name: 'page-contenu',
    surface: 'backoffice',
    route: '/data-fair/pages/{pageId}/edit-config',
    persona: MANAGER,
    goal: 'Sur la page « Nos actions pour la jeunesse », tu veux ajouter en haut un court paragraphe d\'introduction, puis en dessous la liste des données publiées sur le portail. Tu veux voir le résultat à l\'écran avant d\'enregistrer.',
    maxTurns: 8
  },
  // Portal config through portalConfig_form.
  {
    name: 'portail-configuration',
    surface: 'backoffice',
    route: '/data-fair/portals/{portalId}',
    persona: MANAGER,
    goal: 'Tu veux que la couleur principale du portail soit un vert foncé, et que la page « Nos actions pour la jeunesse » apparaisse dans le menu du portail. Tu veux voir les changements à l\'écran avant qu\'ils soient enregistrés.',
    maxTurns: 8
  },
  // Crosses from the pages manager to the portal manager: the assistant cannot
  // create a page itself (no tool), so the person presses the buttons it points to;
  // then the menu is edited on the portal page. Exercises frame changes — the bug
  // class where a discarded frame's tools made the next turn time out.
  {
    name: 'page-puis-menu',
    surface: 'backoffice',
    route: '/data-fair/pages',
    persona: MANAGER + ' Tu fais toi-même les clics qu\'on te demande, un à la fois, mais tu ne cherches pas tout seul dans l\'interface.',
    goal: 'Tu veux créer une nouvelle page « Agenda des événements » sur le portail, puis qu\'elle apparaisse dans le menu du portail. Tu veux qu\'on te guide pas à pas et voir le résultat à l\'écran.',
    maxTurns: 10
  },
  // The navigation the PERSON performs, by opening a link the assistant produced.
  // A filtered view is not reachable by pointing at things, so asking is the only way through.
  {
    name: 'portail-lien-filtre',
    surface: 'portal',
    route: '/',
    persona: RESIDENT + ' Tu prépares une sortie avec une association et tu veux garder de quoi y revenir.',
    goal: 'Tu veux un lien vers la liste des équipements sportifs de plus de 500 places, que tu ouvriras toi-même pour vérifier qu\'il montre bien les bonnes données. Une fois que tu l\'as ouvert, tu veux encore pouvoir poser une question à l\'assistant sur ce que tu as sous les yeux.',
    maxTurns: 6
  },
  // A factual question that needs a real query, shown on screen, not recopied.
  {
    name: 'portail-question-donnees',
    surface: 'portal',
    route: '/datasets/sim-equipements-sportifs',
    persona: RESIDENT + ' Tu es pressé.',
    goal: 'Tu veux savoir combien de piscines il y a dans l\'agglomération et lesquelles sont les plus grandes, et pouvoir les voir à l\'écran — pas seulement une liste recopiée dans la discussion.',
    maxTurns: 6
  }
]
```

Check each route resolves to the intended screen in a browser before the first run: `/data-fair/pages/<pageId>/edit-config` (d-frame `sync-path="/data-fair/pages/"` → manager `/pages/<id>/edit-config`), `/data-fair/portals/<portalId>` (manager `/portals/<id>`), portal `/datasets/sim-equipements-sportifs` (portal dataset routes are plural). Adjust routes, never goals, if a path differs.

- [ ] **Step 8: `simulations/report.ts`** — copy `~/data-fair/data-fair/simulations/report.ts` verbatim (it imports `./cases/index.ts`; `selectCases` is generic so `SimCase` passes through).

- [ ] **Step 9: Lint + types**

Run: `npm run lint && npm run check-types` → PASS.
Run: `npm test -- --list 2>&1 | grep -c sim.spec` → Expected: `0` (the default suite never sees simulations).

- [ ] **Step 10: Bridge-down check (Review Focus 1)** — only if the bridge is NOT running yet:

Run: `SIM_HEADLESS=1 SIM_CASES=page-parametres npm run simulate`
Expected: test fails with `run invalid: The Claude Code bridge is not answering ... npm run dev-bridge`, and `simulations/tmp/sim-page-parametres.run.json` has `"valid": false` with that error.

- [ ] **Step 11: One valid run per surface** (bridge running — ask the user to start it if `status.sh` says DOWN)

```bash
rm -f simulations/tmp/sim-*
SIM_CASES=page-parametres npm run simulate
SIM_CASES=portail-question-donnees npm run simulate
```

Expected: both tests pass (valid runs); each `simulations/tmp/sim-<case>.run.json` has `"valid": true`, `turns >= 1`; the transcript `gateway` array is non-empty. If a run is invalid, fix the harness (routes, selectors, seeding) — never weaken a guard — and re-run. A harness fix inside this task stays in this task's commit.

- [ ] **Step 12: Commit**

```bash
git add playwright.sim.config.ts simulations tsconfig.json
git commit -m "feat(simulations): judged scenarios for portal visitors and portal managers"
```

---

### Task 5: Skill, judge, architecture doc, AGENTS.md

**Files:**
- Create: `.claude/skills/agents-sim/SKILL.md`, `.claude/agents/simulation-judge.md` (via `npx df-agents-sim-init`), `docs/architecture/agent.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Copy the templates**

Run: `npx df-agents-sim-init` → Expected: prints the package version and the two created paths. (Writing under `.claude/skills` may be refused by the harness for the agent; if so, ask the user to run `! npx df-agents-sim-init`.)

- [ ] **Step 2: Adapt `SKILL.md` to portals** — compare with `~/data-fair/data-fair/.claude/skills/agents-sim/SKILL.md` and apply the same portals-relevant content:
  - status command `bash dev/scripts/status.sh`; the bridge is `dev-bridge (opt)`, started only by the maintainer (`npm run dev-bridge` / `bridge` zellij pane).
  - No UI-build prerequisite for back-office cases beyond the running `dev-ui`; `data-fair` and `agents` containers must be UP.
  - Evidence: `simulations/tmp/sim-<case>.json|.run.json|.verdict.json`; delete `simulations/tmp/sim-*` first; confirm start with `ls simulations/tmp/*.run.json`; wait on a PID, never `pgrep -f` a pattern.
  - Cases list in `simulations/cases/index.ts`; `SIM_CASES`, `SIM_ASSISTANT_MODEL`, `SIM_TOOLS_MODEL`, `SIM_USER_MODEL`, `SIM_HEADLESS`.
  - A run wipes `test_`-owned portals data and the `sim-*` datasets.
  - Final step: after a baseline, update `docs/qa/simulations-assistant-ia.md` (only from judged, valid runs).

- [ ] **Step 3: Adapt `simulation-judge.md`** — point its "read the architecture documentation" paragraph at `docs/architecture/agent.md` of this repo, and mention both surfaces (back-office shell + manager frame; public portal). Keep everything else from the template.

- [ ] **Step 4: Write `docs/architecture/agent.md`** (English, factual, from the code — read each file you cite):
  - Frame topology: data-fair shell → `d-frame` → manager UI (`/portals-manager/...`), chat drawer in the shell (`/agents/<type>/<id>/chat`), tools registered by the manager via `useFrameServer` (`ui/src/main.ts`) and BroadcastChannel; a discarded frame announces `mcp-server-stopped` on `pagehide` (lib-vue-agents ≥ 0.6.1).
  - Manager tools: page editor `pageConfig_*` (`ui/src/composables/use-page-config-webmcp.ts`, `includeSubAgent`), simple editor, portal config `portalConfig_form` sub-agent (`ui/src/pages/portals/[id]/index.vue`), `DfAgentChatAction` buttons; what is NOT covered by tools (creating a page, publishing).
  - Portal chat: `portal/app/components/agent-chat.vue` (visibility buckets), `portal/app/composables/agent/` tools and `portal-prompt-context.ts`; portal dataset routes plural; only `_c_`-prefixed filters survive table/map embed sync.
  - Save semantics: edits are drafts until the person saves/validates (cite the exact buttons).

- [ ] **Step 5: AGENTS.md section** — add `### Simulations` after `### Testing`:

```markdown
### Simulations

Judged browser simulations of the AI assistant (`@data-fair/lib-agents-sim`): a simulated
person pursues a goal with the real assistant on a real model, a judge reads the transcript.
Cases live in `simulations/cases/index.ts`; run and judge them with the `/agents-sim` skill.

- Never part of `npm test`, CI or hooks (separate `playwright.sim.config.ts`); they spend Claude plan quota.
- Need the Claude Code bridge (`bridge` zellij pane / `npm run dev-bridge`, port `BRIDGE_PORT`). Only the user starts it.
- A run wipes `test_`-owned portals data and the `sim-*` datasets, and rewrites `test_org1`'s agents settings.
- Status summary: `docs/qa/simulations-assistant-ia.md`; product promises the judge reads: `docs/architecture/agent.md`.
```

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/agents-sim .claude/agents/simulation-judge.md docs/architecture/agent.md AGENTS.md
git commit -m "docs(simulations): agents-sim skill, judge and the agent architecture it reads"
```

---

### Task 6: Baseline

- [ ] **Step 1: Preconditions** — `bash dev/scripts/status.sh`: nginx, dev-api, dev-ui, portal, data-fair, simple-directory, mongo, elasticsearch UP and `dev-bridge (opt)` UP. Otherwise ask the user.

- [ ] **Step 2: Sonnet pass 1** — follow `/agents-sim` exactly: `rm -f simulations/tmp/sim-*`; `nohup npm run simulate > simulations/tmp/run-sonnet-1.log 2>&1 &` with PID wait; one `simulation-judge` per valid case, dispatched identically (case name, goal, transcript path, sidecar path); write verdicts; `npm run simulate:report`. Save a copy: `mkdir -p simulations/tmp/baseline/sonnet-1 && cp simulations/tmp/sim-* simulations/tmp/baseline/sonnet-1/`.

- [ ] **Step 3: Invalid runs** — for each invalid sidecar, root-cause: harness (fix in `simulations/`, commit `fix(simulations): …`, re-run that case) vs environment (rate limit, bridge down → re-run later, not a finding).

- [ ] **Step 4: Sonnet pass 2 and Haiku pass** — same procedure; Haiku with `SIM_ASSISTANT_MODEL=haiku`; copies in `baseline/sonnet-2`, `baseline/haiku`.

- [ ] **Step 5: Findings list** — write `simulations/tmp/findings.md` (not committed): per friction point/finding, the case, the record excerpt, and the confirmed root cause (`file:line`) classified as portals defect / other repo / design decision / harness artefact, with size (small / too large).

---

### Task 7: Fix portals-side findings (repeat per finding)

For each finding classified "portals defect, small" in `simulations/tmp/findings.md`:

- [ ] **Step 1:** If the defect is testable deterministically (tool result shape, prompt context content, URL building, visibility), write a failing unit/e2e test next to the existing tests for that code (`tests/features/...`), run it, see it fail.
- [ ] **Step 2:** Fix minimally.
- [ ] **Step 3:** Run the related tests → PASS; `npm run lint && npm run check-types`.
- [ ] **Step 4:** Re-run the case(s) that exposed it (`SIM_CASES=<case> npm run simulate`), judge, confirm the friction is gone or record what remains.
- [ ] **Step 5:** Commit with the editorial scope, e.g. `fix(ui): …` / `fix(portal): …`, body naming the case and the friction.

Findings in other repos or too large: add to the findings list with evidence and a suggested fix; do not change code. After all fixes, re-run the full suite once on Sonnet (two passes if time allows) for the "after" column.

---

### Task 8: QA document

**Files:**
- Create: `docs/qa/simulations-assistant-ia.md`

- [ ] **Step 1: Collect versions** — `docker inspect` the `agents` and `data-fair` containers for image digests/labels (`docker compose images`), `npm ls @data-fair/lib-agents-sim @data-fair/lib-vue-agents @data-fair/lib-vuetify-agents @koumoul/vjsf`.

- [ ] **Step 2: Write the document in French**, same sections and tone as `~/data-fair/data-fair/docs/qa/simulations-assistant-ia.md`:
  - `# Simulations de l'assistant IA (portails) — état des lieux QA`, `État au <date>`, branch and versions.
  - `## En bref` — satisfied/total per model, before/after fixes, what holds, what is fragile.
  - `## Résultats de la référence` — table: `Cas | Ce que la personne veut | Sonnet 1 | Sonnet 2 | Haiku`, ✓/✗ with friction counts from the verdicts; then why each failure happened.
  - `## Ce que la référence a fait corriger` — `Constat | Correction | Où`; cross-repo findings listed with "signalé, non corrigé ici".
  - `## Limites et prochaines étapes` — open findings, coverage gaps (e.g. reuses, English, contributor role), cadence.
  - `## Fonctionnement` — two surfaces, persona/assistant/judge, invalid runs, `/agents-sim`, out of `npm test`/CI.
  Only judged, valid runs fill the table; an invalid run is shown as "invalide (raison)".

- [ ] **Step 3: Commit**

```bash
git add docs/qa/simulations-assistant-ia.md
git commit -m "docs(simulations): QA summary of the portals assistant simulations"
```
