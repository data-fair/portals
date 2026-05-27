# Portals - Agent Guidelines

## Project Overview

Portals is the portal manager for the Data FAIR platform, developed by Koumoul. It allows creating and managing public data portals with customizable themes, pages, and content.

## Dev environment

The dev environment is managed by zellij (terminal multiplexer) and docker compose. **Never start, stop, or restart dev processes yourself** — the user manages them through zellij panes.

### Checking status

```bash
bash dev/scripts/status.sh
```

This shows the health of all services (nginx, API, UI, portal, docker services, databases) and lists log files with sizes and timestamps.

### Log files

All dev processes write to `dev/logs/`:

- `dev-api.log` — API server
- `dev-ui.log` — UI dev server (Vite)
- `dev-portal.log` — Portal (Nuxt)
- `dev-ingress-manager.log` — Mock ingress manager
- `docker-compose.log` — all docker compose services

### Troubleshooting

1. Run `bash dev/scripts/status.sh` to identify which services are down
2. Read the relevant log file in `dev/logs/` for error details
3. Report findings to the user — do not attempt to fix infrastructure issues yourself

### Port assignments

Port numbers are defined in `.env`. Do not modify port assignments.

### Git worktrees

To work on a separate branch in an isolated environment (own `.env`, own
docker compose project, randomized ports so it doesn't clash with the main
checkout), **always use the project scripts** — never `git worktree add` by
hand:

```bash
bash dev/worktree.sh <branch-name>     # create worktree + .env + npm ci + build-types + ui build
bash dev/delete-worktree.sh <branch>   # stops/removes containers + volumes + images, then removes the worktree
```

`dev/worktree.sh` does the full setup the manual `git worktree add` skips
(env file, dependencies, type and UI builds). `dev/delete-worktree.sh` runs
`docker compose --profile dev --profile test down -v --remove-orphans
--rmi local` so a deleted worktree leaves no leftover containers, named
volumes, or locally-built images.

### Test and dev environment

The environment allows for integration testing thanks to docker containers (see docker-compose.yml).
Random ports are allocated and defined in `.env`.
A nginx proxy is part of the containers and exposes all services, including the development API server (configured in dev/resources/nginx.conf.template).
Test users are defined in dev/resources/users.json

The test cleanup endpoint (`DELETE /api/test-env`) only removes data whose `owner.id` starts with `test_`. Use the dev-only superadmin `superadmin@dev.com` (id `dev_superadmin`, password `passwd`, member of org `dev_org`) to play around manually without seeing your data wiped by tests.

### Testing

```bash
npm test                          # all tests
npm run test-unit                 # unit tests only
npm run test-api                  # API tests only
npm run test-e2e                  # e2e tests only
npm run test -- path/to/file      # specific file
```

The test suite is very long — when iterating on changes always run only the related test cases. The full test suite will be run when pushing by a git hook managed by husky.

### Linting & Type Checking

```bash
npm run lint             # ESLint for all workspaces
npm run lint-fix         # Auto-fix lint issues
npm run check-types      # TypeScript type checking
```

### Building

```bash
npm run build-types      # Build type definitions from schemas
npm -w ui run build      # Build UI
```

### Commits & release notes

- Commit message convention (allowed types and scopes, ambiguous cases): see `dev/COMMITS.md`. The `scope-enum` rule is enforced as error — an unknown scope rejects the commit.
- Release notes format and category mapping: see `dev/RELEASES.md`.

### Performance profiling

The edit-config page (page editor) has known performance sensitivity due to the complex VJSF oneOf schema (38 element types). A Playwright seed file exists for interactive profiling:

- **Seed file**: `tests/perf-seed.e2e.spec.ts`
- **Key schema**: `api/types/page-elements/schema.js` (uses `discriminator: { propertyName: 'type' }` to optimize oneOf resolution in `@json-layout/core`)
- **Profiling method**: Use Playwright MCP `generator_setup_page` with the seed file, then `browser_evaluate` to inject `PerformanceObserver` for long tasks and measure interaction latency
