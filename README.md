# data-fair/portals

Portals manager for data-fair.

Install dependencies and launch service dependencies with docker-compose:

    npm install
    npm run dev-deps

Run the 2 development servers with these commands in separate shells:

    npm run dev-server
    npm run dev-client

Run pre-built nuxt like in production but in dev environment:

    NODE_ENV=development npm run build
    PROXY_NUXT=false npm run dev-server