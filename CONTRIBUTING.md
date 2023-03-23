# Contribution guidelines

## Development environment

Install dependencies:

    npm install

If you use [tmux](https://github.com/tmux/tmux/wiki) you can replace all the following steps with `npm run dev-tmux`, otherwise follow the next instructions.

Switch to the appropriate nodejs version:

    nvm use

Run the services dependencies:

    npm run dev-deps

Run the 2 development servers with these commands in separate shells:

    npm run dev-server
    npm run dev-client

Run pre-built nuxt like in production but in dev environment:

    NODE_ENV=development npm run build
    PROXY_NUXT=false npm run dev-server

Run test suite:

    npm test

## Docker image

Test building the docker image:

    docker build --network=host -t portals-dev .
    // don't expect the following line to work fully, it will be missing service dependencies, etc.
    docker run --network=host --env PORT=8081 portals-dev


## Git quality checks

This project uses [husky](https://typicode.github.io/husky/) and  to ensure quality of commits. The pre-commit hook runs the docker image build, this way we get linting, testing, and building all checked in 1 step.

The original setup was created like so:

```
npm i -D husky
npm pkg set scripts.prepare="husky install"
npm run prepare
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-push "docker build --network=host -t portals-dev ."

npm i -D @commitlint/config-conventional @commitlint/cli
echo "module.exports = { extends: ['@commitlint/config-conventional'] }" > commitlint.config.js
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit ""'
```