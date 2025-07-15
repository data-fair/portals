# Contribution guidelines

## Prerequisites

  - A Javascript/Typescript IDE with [Vue.js](https://vuejs.org/)  and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) support.
  - A recent [Docker](https://docs.docker.com/engine/install/) installation.
  - [Node.js v22+](https://nodejs.org/)

## Install dependencies

Install npm dependencies for all workspaces:
```
npm install
```

Pull images at first and then once in a while:

```bash
ddocker compose pull
```

## Run the development servers

The recommended way to run the development servers is to use [zellij](https://zellij.dev/):

```
npm run dev-zellij
```

## Working on types

Update the types based on schemas:

```
npm run build-types
```

## Building docker images

Build images:

```
docker build --progress=plain --target=main -t data-fair/portals:dev .
```
