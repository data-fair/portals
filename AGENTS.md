# Portals - Agent Guidelines

## Project Overview

Portals is the portal manager for the Data FAIR platform, developed by Koumoul. It allows creating and managing public data portals with customizable themes, pages, and content.

## Dev environment

The user starts the dev environment of a checkout with `npm run dev-zellij` (zellij >= 0.44, session named after the checkout directory). Agents never start or kill the session, and act on processes and containers only through `df-dev`:

```bash
npx --no df-dev status                     # containers (health, memory), panes (running / exited + code), dev processes memory
npx --no df-dev logs api -n 100            # last lines of a pane: api, ui, portal, ingress-manager, bridge
npx --no df-dev restart api                # Ctrl+C, rerun, wait for /api/ping
npx --no df-dev up agents events maildev   # optional containers (compose profiles), added to the running env
npx --no df-dev down maildev
```

- Read the logs before restarting: nodemon (api, ingress-manager), vite (ui) and nuxt (portal) already reload on file changes. Restart only a pane that exited, hangs, or needs new env.
- If `restart` answers "not ready", report to the user with the logs instead of retrying.
- Never use `docker compose restart`, `kill` or `zellij action` directly.
- Optional containers: `agents` (back-office and portal chat, simulations), `events`, `maildev` (contact form mails). The user can start them with the env: `npm run dev-zellij -- --services agents,events,maildev`.

### Port assignments

Port numbers are defined in `.env`. Do not modify port assignments.

### Git worktrees

To work on a separate branch in an isolated environment (own `.env`, own
docker compose project, randomized ports so it doesn't clash with the main
checkout), **always use the df-dev scripts from the main checkout** — never
`git worktree add` by hand:

```bash
npx --no df-worktree <branch-name>          # ../portals_<branch>: npm ci + df-dev setup (.env, types, UI build (once))
npx --no df-worktree-delete <branch> [-f]   # containers + volumes + images + zellij session, then the worktree
```

Branch names: letters, digits, `.`, `_`, `-`, at most 60 characters, no `/`.

### Test and dev environment

The environment allows for integration testing thanks to docker containers (see docker-compose.yml).
Random ports are allocated and defined in `.env`.
A nginx proxy is part of the containers and exposes all services, including the development API server (configured in dev/resources/nginx.conf.template).
Test users are defined in dev/resources/users.template.json (rendered to the git-ignored users.json with the host and port of `.env` by `node dev/render-users.mjs`: df-dev setup, the status pane, CI)

The scope tests use a non-human identity, `test_org1_scope_nhi` (admin of `test_org1`,
in dev/resources/users.template.json and organizations.json): `nhiSession(scope?)` in `tests/support/nhi.ts`
exchanges its assertion for a scoped (or, without scope, unrestricted) session.

The test cleanup endpoint (`DELETE /api/test-env`) only removes data whose `owner.id` starts with `test_`. Use the dev-only superadmin `superadmin@dev.com` (id `dev_superadmin`, password `passwd`, member of org `dev_org`) to play around manually without seeing your data wiped by tests.

### Testing

```bash
npm test                          # all tests
npm run test-unit                 # unit tests only
npm run test-api                  # API tests only
npm run test-api-fast             # API tests, stop at the first failure (iteration only)
npm run test-e2e                  # e2e tests only
npm run test -- path/to/file      # specific file
```

Tests are organized under `tests/features/<topic>/<name>.{unit,api,e2e}.spec.ts`; api and e2e
specs import `test` / `expect` from `tests/fixtures/login.ts` (manager, API login) or
`tests/fixtures/portal.ts` (public portal, extends it). The `state-setup` project checks that the
dev API is up, `e2e-warmup` visits the portal and the heavy manager routes once so the nuxt and
vite first-hit costs are paid before the e2e tests. On a failure the api, ui and portal pane logs
are attached to the trace (`npx playwright show-trace test-results/<test>/trace.zip`); per-test
durations of the last run are in `dev/logs/test-timings.json`. Keep the 30 s test timeout (hooks
included): a heavy spec calls `test.slow()`. Pure logic goes to unit tests: API functions in
`api/src/<domain>/operations.ts` (no `#mongo`, `#config` or state), portal ones in `portal/app/utils/`.

Quality gates:

| When | What |
|---|---|
| commit (`.husky/pre-commit`) | `npm run lint` |
| push (`.husky/pre-push` → `dev/pre-push.sh`) | type check, unit tests, the `@smoke` api/e2e tests, and the api/e2e spec files changed since `origin/master` |
| pull request, release tag, nightly on master (`reuse-quality.yml`) | lint, types, UI build, audit, and the whole unit/api/e2e suite; the nightly runs without retries, its e2e tests on one browser engine per night (chromium, firefox, webkit in turn; pull requests stay on chromium), and is skipped when this master commit already passed a night on that engine |

`@smoke` (`test('...', { tag: '@smoke' }, ...)`) marks a few fast tests over the core flows
(portal and page creation, publication request, image upload, portal home and navigation,
portals and pages lists, page editor draft). Tag a test only if it is fast and covers a path
many features depend on. When iterating, run only the related test cases; `npm run quality`
runs the full gate locally.

### API for agents

The manager API is usable by AI agents through OAuth scopes and an `x-agent` annotated OpenAPI
document that data-fair merges into its platform document:

- `docs/architecture/scopes.md`: scope vocabulary and tiers, the operations table in
  `api/src/scopes.ts`, any-scope and refused routes, the publication-site sync of agent sessions.
- `docs/architecture/api-docs.md`: the document, its tools, editor tool groups and skills, how
  data-fair merges it (namespace `portals`). The agent surface is pinned by
  `tests/fixtures/agent-surface.json`.

### Simulations

Judged browser simulations of the AI assistant (`@data-fair/lib-agents-sim`): a simulated
person pursues a goal with the real assistant on a real model, then a judge reads the
transcript. Cases live in `simulations/cases/index.ts` and run on two surfaces — the
data-fair back-office shell embedding the manager UI, and the public portal's own chat.
Run and judge them with the `/agents-sim` skill.

- Never part of `npm test`, CI or hooks (separate `playwright.sim.config.ts`): they spend
  Claude plan quota.
- They need the `agents` container (`npx --no df-dev up agents`) and the Claude Code bridge
  (`bridge` zellij pane, suspended until the user presses Enter in it, port `BRIDGE_PORT`
  in `.env`). Only the user starts the bridge.
- A run wipes `test_`-owned portals data (`DELETE /api/test-env`), recreates the `sim-*`
  datasets in data-fair, and rewrites `test_org1`'s agents settings and data-fair topics.
- Status summary: `docs/qa/simulations-assistant-ia.md`. What the judge reads as the
  product's promises: `docs/architecture/agent.md`.

Autonomous-agent cases (`simulations/autonomous-agent.sim.spec.ts`, cases in
`simulations/cases/autonomous-agents.ts`, runner in `simulations/runner/autonomous-agent.ts`):
an agent of `test_org1`, acting as its own NHI, uses the `portals_*` / `datafair_*` tools of the
mcp server. The judge also reads the stored portals state (`hostState`) read back by the case's `check`.

- They need the `agents` profile (agents + mcp containers: `npx --no df-dev up agents`) and the
  bridge, which only the user starts. Never part of `npm test` or CI.
- Four agent identities (NHIs of `test_org1`, defined in `dev/resources/users.template.json`;
  `dev/resources/users.json` is rendered from it by `dev/render-users.mjs` and git-ignored):
  `sim-pages-write`, `sim-pages-admin`, `sim-pages-read`, `sim-portals-write`
  (user ids `test_org1_<scope>_nhi`). Each case picks its scopes by picking its agent.
- `MCP_PORT` (nginx exposes the mcp server on `/mcp-server/`). `df-dev init-env` never adds a port
  to an existing `.env` (`--force` redraws all of them): in an existing worktree add `MCP_PORT=<free port>`
  by hand, otherwise nginx cannot start when it is recreated.
- simple-directory validates NHI scopes against data-fair's `scopes.json` (`PLATFORM_SCOPES_URL`),
  which lists portals' scopes only while data-fair's platform document holds a good fragment of portals
  (fetched while the portals api was up).
- Seeding the data case registers a base application from cdn.jsdelivr: the data-fair container
  needs internet access.

### Linting & Type Checking

```bash
npm run lint             # ESLint for all workspaces
npm run lint-fix         # Auto-fix lint issues
npm run check-types      # TypeScript type checking (needs the UI build made by `npx --no df-dev setup`: it generates the auto-import declarations)
```

### Building

```bash
npm run build-types      # Build type definitions from schemas
npm -w ui run build      # Production UI build (done once by `npx --no df-dev setup`; re-run only to refresh the auto-import declarations)
```

### Commits & release notes

- Commit message convention (allowed types and scopes, ambiguous cases): see `dev/COMMITS.md`. The `scope-enum` rule is enforced as error — an unknown scope rejects the commit.
- Release notes format and category mapping: see `dev/RELEASES.md`.

### Performance profiling

The edit-config page (page editor) has known performance sensitivity due to the complex VJSF oneOf schema (38 element types). A Playwright seed file exists for interactive profiling:

- **Seed file**: `tests/perf-seed.ts` (project `perf-seed`, declared only when `PERF_SEED` is set, as `.mcp.json` does: it is not part of the suite)
- **Key schema**: `api/types/page-elements/schema.js` (uses `discriminator: { propertyName: 'type' }` to optimize oneOf resolution in `@json-layout/core`)
- **Profiling method**: Use Playwright MCP `generator_setup_page` with the seed file, then `browser_evaluate` to inject `PerformanceObserver` for long tasks and measure interaction latency
