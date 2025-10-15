##########################
FROM node:24.10.0-alpine3.22 AS base

WORKDIR /app
ENV NODE_ENV=production

##########################
FROM base AS package-strip

RUN apk add --no-cache jq moreutils
ADD package.json package-lock.json ./
# remove version from manifest for better caching when building a release
RUN jq '.version="build"' package.json | sponge package.json
RUN jq '.version="build"' package-lock.json | sponge package-lock.json

##########################
FROM base AS installer

RUN apk add --no-cache python3 make g++ git jq moreutils
RUN npm i -g clean-modules@3.0.4
COPY --from=package-strip /app/package.json package.json
COPY --from=package-strip /app/package-lock.json package-lock.json
ADD ui/package.json ui/package.json
ADD api/package.json api/package.json
ADD portal/package.json portal/package.json
# full deps install used for types and ui building
# also used to fill the npm cache for faster install of api deps
RUN npm ci --omit=dev --omit=peer --no-audit --no-fund

##########################
FROM installer AS types

ADD api/types api/types
ADD api/doc api/doc
ADD api/config api/config
RUN npm run build-types

##########################
FROM installer AS ui

RUN npm i --no-save @rollup/rollup-linux-x64-musl
COPY --from=types /app/api/config api/config
COPY --from=types /app/api/types api/types
ADD /api/src/config.ts api/src/config.ts
ADD /api/src/ui-config.ts api/src/ui-config.ts
ADD /ui ui
ADD /portal/app/components portal/app/components
COPY --from=types /app/ui/src/components/vjsf ui/src/components/vjsf
RUN npm -w ui run build

##########################
FROM installer AS api-installer

RUN cp -rf node_modules/@img/sharp-linuxmusl-x64 /tmp/sharp-linuxmusl-x64 && \
    cp -rf node_modules/@img/sharp-libvips-linuxmusl-x64 /tmp/sharp-libvips-linuxmusl-x64 && \
    npm ci -w api --prefer-offline --omit=dev --omit=optional --omit=peer --no-audit --no-fund && \
    npx clean-modules && \
    cp -rf /tmp/sharp-linuxmusl-x64 node_modules/@img/sharp-linuxmusl-x64 && \
    cp -rf /tmp/sharp-libvips-linuxmusl-x64 node_modules/@img/sharp-libvips-linuxmusl-x64
RUN mkdir -p /app/api/node_modules

##########################
FROM base AS fonts-builder

ADD /dev/scripts/prepare-fonts.js prepare-fonts.js
RUN npm pack google-fonts-complete@2.2.3 &&\
    tar -xzf google-fonts-complete-2.2.3.tgz &&\
    rm google-fonts-complete-2.2.3.tgz &&\
    mv package google-fonts-complete
RUN mkdir -p api/assets/fonts
RUN node prepare-fonts.js

##########################
FROM installer AS portal-builder

ADD /portal portal
RUN npm -w portal run build

##########################
FROM base AS portal

COPY --from=portal-builder /app/portal/.output portal/.output
ADD package.json README.md LICENSE BUILD.json* ./

ENV PORT=8080
ENV HOST=0.0.0.0

EXPOSE 8080
USER node
WORKDIR /app/portal
CMD ["node", "/app/portal/.output/server/index.mjs"]

##########################
FROM base AS manager

COPY --from=fonts-builder /app/api/assets api/assets
COPY --from=api-installer /app/node_modules node_modules
ADD /api api
COPY --from=types /app/api/types api/types
COPY --from=types /app/api/doc api/doc
COPY --from=types /app/api/config api/config
COPY --from=api-installer /app/api/node_modules api/node_modules
COPY --from=ui /app/ui/dist ui/dist
ADD package.json README.md LICENSE BUILD.json* ./
# artificially create a dependency to "portal" target for better caching in github ci
COPY --from=portal /app/package.json package.json
EXPOSE 8080
EXPOSE 9090
USER node
WORKDIR /app/api

VOLUME /app/tmp

CMD ["node", "--max-http-header-size", "64000", "index.ts"]
