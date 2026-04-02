# Portals - Agent Guidelines

## Project Overview

Portals is the portal manager for the Data FAIR platform, developed by Koumoul. It allows creating and managing public data portals with customizable themes, pages, and content.

## Dev environment

The dev environment is managed by zellij (terminal multiplexer) and docker compose. **Never start, stop, or restart dev processes yourself** — the user manages them through zellij panes.

### Checking status

```bash
bash dev/status.sh
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

1. Run `bash dev/status.sh` to identify which services are down
2. Read the relevant log file in `dev/logs/` for error details
3. Report findings to the user — do not attempt to fix infrastructure issues yourself

### Port assignments

Port numbers are defined in `.env`. Do not modify port assignments.

### Test and dev environment

The environment allows for integration testing thanks to docker containers (see docker-compose.yml).
Random ports are allocated and defined in `.env`.
A nginx proxy is part of the containers and exposes all services, including the development API server (configured in dev/resources/nginx.conf.template).
Test users are defined in dev/resources/users.json

### Testing

```bash
npm run test-deps                 # start test dependencies
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
