# Portals - Agent Guidelines

## Project Overview

Portals is the portal manager for the Data FAIR platform, developed by Koumoul. It allows creating and managing public data portals with customizable themes, pages, and content.

Design specs and implementation plans are not kept in this repository; durable architecture docs live in `docs/architecture/`.

## Dev environment

Quick start without any tooling: `npm ci && npm run dev` (fixed ports from `dev/default.env`, overridden by `.env`), then `npm test`.

The environment is started by the user, in a terminal: `npm run dev` starts the containers, the ingress manager, the api, the ui and the portal, logs in `dev/logs` (`ingress.log`, `api.log`, `ui.log`, `portal.log`). Read the logs before restarting anything: nodemon (api, ingress manager), vite (ui) and nuxt (portal) already reload on file changes. Agents do not kill the processes or containers they did not start.

Each dev process also has its own npm script, reading its settings from environment variables (`dev/default.env` overridden by `.env`): `npm run dev-deps` (containers only), `npm run dev-setup` (idempotent builds), `npm run dev:ingress`, `npm run dev:api`, `npm run dev:ui`, `npm run dev:portal`.

- Core containers: mongo, elasticsearch, simple-directory, data-fair, nginx. Optional: `agents` (back-office and portal chat; starts `mcp` too), `events`, `capture` (renders the pages for the agents' page preview, needs the `capture` image and simple-directory's pseudo sessions), `maildev` (contact form mails). Start them with a compose profile: `npm run dev -- --profile events --profile agents`. An optional service is absent when its port variable is empty (`EVENTS_PORT=`); `npm run dev` blanks the ports of the optional containers that are not running, so restart `npm run dev` after adding one.

### Port assignments

Port numbers are defined in `dev/default.env`: do not change `dev/default.env`, override locally in `.env`.

### Test and dev environment

The environment allows for integration testing thanks to docker containers (see docker-compose.yml).
A nginx proxy is part of the containers and exposes all services, including the development API server (configured in dev/resources/nginx.conf.template).
simple-directory stores its accounts in mongo. Test users and organizations live in `tests/support/sd-fixtures.ts`:
the sub-space `test_portals_` (every user, organization and member id, and every email, starts with it; password
`passwd`). The tests seed it through simple-directory's test API (`DELETE /api/test-env?prefix=test_portals_`, then
`POST /api/test-env/seed`), in `tests/global-setup.ts` (before the spec files, which log in at import time, are
loaded) and in `tests/state-setup.ts` (the setup project of the tests).

The scope tests use a non-human identity, `test_portals_org1_scope_nhi` (admin of `test_portals_org1`,
in `tests/support/sd-fixtures.ts`): `nhiSession(scope?)` in `tests/support/nhi.ts`
exchanges its assertion for a scoped (or, without scope, unrestricted) session.

The test cleanup endpoint (`DELETE /api/test-env?prefix=test_portals_`) only removes data whose `owner.id`
starts with the prefix (400 on a missing or malformed prefix). The repository ships no dev data: to play
around manually, seed an account of your own through the same test API (`POST /api/test-env/seed`, as
`tests/support/sd-fixtures.ts` does) under another prefix than `test_portals_`, so that the tests never clean it.

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
- simple-directory validates NHI scopes against data-fair's `scopes.json` (`PLATFORM_SCOPES_URL`),
  which lists portals' scopes only while data-fair's platform document holds a good fragment of portals
  (fetched while the portals api was up).

### Simulations

The judged browser simulations of the assistant (a simulated person, a real model, a judge reading the
transcript) are not kept in this repository. What a judge reads as the product's promises is
`docs/architecture/agent.md`, keep it current when the agent tools change.

### Linting & Type Checking

```bash
npm run lint             # ESLint for all workspaces
npm run lint-fix         # Auto-fix lint issues
npm run check-types      # TypeScript type checking (needs the UI build made by `npm run dev-setup`: it generates the auto-import declarations)
```

### Building

```bash
npm run build-types      # Build type definitions from schemas
npm -w ui run build      # Production UI build (done once by `npm run dev-setup`; re-run only to refresh the auto-import declarations)
```

### Commits

- Commit message convention (allowed types and scopes, ambiguous cases): see `dev/COMMITS.md`. The `scope-enum` rule is enforced as error — an unknown scope rejects the commit.

### Performance profiling

The edit-config page (page editor) has known performance sensitivity due to the complex VJSF oneOf schema (38 element types). A Playwright seed file exists for interactive profiling:

- **Seed file**: `tests/perf-seed.ts` (project `perf-seed`, declared only when `PERF_SEED` is set, as `.mcp.json` does: it is not part of the suite)
- **Key schema**: `api/types/page-elements/schema.js` (uses `discriminator: { propertyName: 'type' }` to optimize oneOf resolution in `@json-layout/core`)
- **Profiling method**: Use Playwright MCP `generator_setup_page` with the seed file, then `browser_evaluate` to inject `PerformanceObserver` for long tasks and measure interaction latency
