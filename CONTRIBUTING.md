# Contribution guidelines

## Prerequisites

- A Javascript/Typescript IDE with [Vue.js](https://vuejs.org/) and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) support.
- A recent [Docker](https://docs.docker.com/engine/install/) installation.
- [Node.js v24+](https://nodejs.org/) — the project ships an `.nvmrc`, so if you use [nvm](https://github.com/nvm-sh/nvm) you can simply run `nvm use` from the project root to switch to the right version.

## Install dependencies

1. Generate the `.env` file (random ports, dev host) — only needed once on the main checkout, worktrees created via `./dev/worktree.sh` do this automatically :

```sh
./dev/init-env.sh
```

2. Install npm dependencies for all workspaces :

```sh
npm i
```

3. Build / Update the types based on schemas :

```sh
npm run build-types
```

4. Build the UI once :

```sh
npm -w ui run build
```

> Known bug: the API currently fails to start without a built UI bundle, so this initial build is required even for pure API/dev work. It only needs to be re-run if you blow away `ui/dist`.

## Start the development environment

```sh
npm run dev-zellij
```

*Note : This command will start a Zellij session with 4 panes, each one running a part of the project. You can also run the environment manually by running the commands below in 4 different terminals.*

<details>
<summary>Services</summary>

- **Dev dependencies** (docker compose stack) : `npm run dev-deps`
- **API** : `npm run dev-api`
- **UI** : `npm run dev-ui`
- **Portal** : `npm run dev-portal`
- **Mock ingress manager** : `npm run dev-ingress-manager`

</details>

## Stop the development environment

```sh
npm run stop-dev-deps
```

## Working with Git Worktrees

This project supports git worktrees with fully isolated port allocations, allowing multiple branches to run concurrently (useful for AI agents or parallel development). Run `./dev/worktree.sh <branch-name>` to create a new worktree with its own `.env`, Docker Compose project, and randomized port range. When setting up for the first time, not in a worktree, you can run `./dev/init-env.sh`.

## Building the Docker images

```sh
docker build --progress=plain --target=manager -t data-fair/portals/manager:dev .
docker build --progress=plain --target=portal -t data-fair/portals/portal:dev .
```

## Running the tests

First, you need the full dev environment up (the test suite hits the API/UI/portal as well as the docker compose services) :

```sh
npm run dev-zellij
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
- `EVENTS_LOG_LEVEL=alert` : Disable the lib express events log in the console, to avoid too much noise.

</details>
