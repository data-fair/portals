# Contribution guidelines

## Prerequisites

- A Javascript/Typescript IDE with [Vue.js](https://vuejs.org/) and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) support.
- A recent [Docker](https://docs.docker.com/engine/install/) installation.
- [Node.js v24.11+](https://nodejs.org/) — the postcss / cssnano dependencies of the portal need at least 24.11. The project ships an `.nvmrc` (the version of the Docker image), so if you use [nvm](https://github.com/nvm-sh/nvm) you can simply run `nvm use` from the project root to switch to it.

## Quick start

```sh
npm ci
npm run dev
```

Docker is required: mongo, elasticsearch, simple-directory, data-fair and nginx run in containers; the ingress manager, api, ui and portal run in the terminal (Ctrl+C stops them, their logs are in `dev/logs/`). The manager is available at <http://localhost:5650/portals-manager/dev> and the portals at `http://<portal>.portals.localhost:5650/`.

Then, in another terminal:

```sh
npm test
```

The default ports (5650-5667) are in `dev/default.env`, copied to `.env` the first time: `.env` overrides `dev/default.env` and is never overwritten. `npm run dev-deps` only starts the containers (extra arguments go to docker compose, e.g. `npm run dev-deps -- --profile events --profile maildev`); `npm run dev` accepts the same arguments.

Each dev process has its own npm script and reads its settings from environment variables (every key of `dev/default.env`): `npm run dev-setup` (idempotent builds, no container), then `npm run dev:ingress`, `npm run dev:api`, `npm run dev:ui`, `npm run dev:portal` (and `npm run dev:bridge`, the Claude Code bridge of the simulations), each in its own terminal with the variables of `.env` exported. An optional service (events, agents, mcp, capture) is absent when its port variable is empty (for example `EVENTS_PORT=`); `npm run dev` blanks the ports of the optional containers that are not running. `DEV_LOG_DIR` (default `dev/logs`) and `DEV_LOG_PREFIX` set where `npm run dev` writes the logs of the processes.

Stop the containers with `npm run stop-dev-deps`.

## Alternative: zellij environment

```sh
npx --no df-dev setup   # .env with free ports (kept if it exists, --force to redraw), types, UI build (once)
npm run dev-zellij                                        # core containers + api, ui, portal, ingress manager
npm run dev-zellij -- --services agents,events,maildev    # with the optional containers
```

This opens a zellij (>= 0.44) session named after the checkout directory, or attaches to it if it is already running. The `status` pane shows containers, panes and memory; the `bridge` pane (Claude Code bridge for the simulations) waits for Enter.

From another terminal (or an agent): `npx --no df-dev status`, `npx --no df-dev logs <pane>`, `npx --no df-dev restart <pane>`, `npx --no df-dev up <service>`. Quit zellij, then `npm run stop-dev-deps`.

## Working with Git Worktrees

From the main checkout, `npx --no df-worktree <branch-name>` creates `../portals_<branch-name>` with its own `.env`, docker compose project and ports; `npx --no df-worktree-delete <branch-name>` removes it with its containers and volumes. Branch names: letters, digits, `.`, `_`, `-`, at most 60 characters, no `/`.

## Building the Docker images

```sh
docker build --progress=plain --target=manager -t data-fair/portals/manager:dev .
docker build --progress=plain --target=portal -t data-fair/portals/portal:dev .
```

## Running the tests

First, you need the full dev environment up (the test suite hits the API/UI/portal as well as the docker compose services) :

```sh
npm run dev
```

Then, you can run the tests :

```sh
npm run test           # full suite
npm run test-unit      # unit tests only
npm run test-api       # API tests only
npm run test-e2e       # e2e tests only
```

To run a specific test file :

```sh
npm run test -- path/to/file.spec.ts
```

You can also mark a test with `.only` (e.g. `it.only`, `test.only`, `describe.only`) and run the project it belongs to.

## Random information

<details>
<summary>Expand...</summary>

### package.json scripts description

- `"prepare": "husky || true"` : Initializes Husky hooks before the first `npm install`. The `|| true` ensures the command doesn't fail if Husky is not installed or encounters an error.

</details>
