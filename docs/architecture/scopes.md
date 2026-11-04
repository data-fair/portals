# OAuth scopes

A session can carry a `scope` claim: an access token obtained by a non human identity (NHI)
through simple-directory's token exchange (`<directoryUrl>/api/auth/nhi-token`, RFC 7523 JWT
bearer assertion). A session without a `scope` claim is unrestricted (humans, unscoped NHIs) and
behaves exactly as before: every scope check is a no-op for it. A scoped session gets the
intersection of its roles and its scopes: the scope guards only ever refuse, every role check of
the routes (`assertAccountRole`, `getPortalAsAdmin`, `getPageAsContrib`, `assertAdminMode`...)
still applies.

Code: `api/src/scopes.ts` (vocabulary, the operations table, guards, any-scope and refused
routes), `api/src/app.ts` (`/api/scopes.json`, the any-scope root routes), the routers of
`api/src/*/router.ts` (one guard per route). The lib side (`session.reqWithScope`,
`allowAnyScope`, refusal of unchecked routes) is in `@data-fair/lib-express`, the vocabulary
helpers (`defineScopes`, `acceptedScopes`, `oauth2Alternatives`) in
`@data-fair/lib-common-types/scopes.js`. The same conventions as data-fair's
`docs/architecture/scopes.md`.

## Vocabulary and tiers

Three families, `portals`, `pages` and `reuses`, each with `:read`, `:write`, `:admin` and a bare
umbrella (`pages` covers every tier), plus the global tier scopes `all:read`, `all:write`,
`all:admin` shared by every service of the platform. The vocabulary is built with `defineScopes`,
with a French and an English description per scope.

A tier accepts itself, the higher tiers, the umbrella and the global tier scopes at or above it
(`acceptedScopes(family, tier)`: `pages:read` is satisfied by `pages:write`, `pages:admin`,
`pages`, `all:read`, `all:write` and `all:admin`). Matching is exact, never prefix.

`GET /api/scopes.json` (public, any scope) answers the descriptions in the language of
`Accept-Language`. simple-directory reads the platform's list (data-fair's
`/api/v1/scopes.json`, which collects the scopes of every service of its platform document) to
decide which scopes an admin may store on an NHI; in the dev stack it reads portals' list directly
(`PLATFORM_SCOPES_URL` in `docker-compose.yml`).

What each tier means, per family:

| Family | read | write | admin |
| --- | --- | --- | --- |
| `portals` | the portals, their draft config and schema, fonts | edit the draft config, discard it, upload and update fonts | create, publish, delete a portal, its owner, staging and contributor departments, delete fonts |
| `pages` | pages and page groups, draft config and schema | create pages and groups, edit the draft, discard it | publish, delete, attach to portals (`portals`, `requestedPortals`), transfer (`owner`) |
| `reuses` | reuses | create, edit the draft, discard it | publish, submit, delete, attach to portals, transfer, edit the live `config` |

## The operations table is the source

`scopedOperations` in `api/src/scopes.ts` lists every scoped operation by operationId: method,
OpenAPI-style path relative to `/api`, family and tier. Three things are built from it:

- the guard of the route: `requireOperationScope(operationId)`, the first handler after the body
  parsers (the tier may depend on the body, it is decided before the route reads or writes
  anything);
- the `security` of the operation in the OpenAPI document (`api/contract/api-docs.ts`): the
  cookie session and one `{ oauth2: [scope] }` alternative per accepted scope;
- the coverage test, which checks that every mounted route is one of them.

Adding a route means adding its line to the table (or to `anyScopeRoutes` / `refusedRoutes`), its
guard in the router, and its path in the document: `scopes-coverage.unit.spec.ts` and
`scopes-openapi.unit.spec.ts` fail otherwise.

### Body-dependent tiers

`bodyTiers` raises the tier of an operation when the body carries some properties
(`operationTier(operation, body)`, the highest one wins):

| Operation | Admin-tier body properties |
| --- | --- |
| `PATCH /portals/{id}` (write) | `owner`, `staging`, `contributorDepartments` |
| `POST /pages` (write) | `portals` |
| `PATCH /pages/{id}` (write) | `portals`, `requestedPortals`, `owner` |
| `POST /reuses` (write) | `portals` |
| `PATCH /reuses/{id}` (write) | `config` (the live configuration: changing it is a publication), `portals`, `requestedPortals`, `owner` |

Whatever the session, the `portals` ids a page or a reuse is attached to must be portals of its
owner (type and id, the department may differ): another owner's or an unknown portal is refused
with a 400 naming it (`assertOwnerPortals`, `foreignPortalId`), so attaching a standard page never
detaches a page of another account (`switchStandardPages` also stays within the owner).
`requestedPortals` is not checked: a request on a portal of another owner is never shown, and the
reuse submission moves the reuse to the portal's owner first.

Superadmin-only body properties (`whiteLabel`, `isReference`, `md2Compat` of a portal) stay behind
`assertAdminMode`, which a scoped session never passes (lib-express refuses superadmin claims on
scoped tokens), present with any value, `false` included.

### Images

An image belongs to a portal, a page or a reuse: its family is the one of its resource
(`imageOperations`, `imageScope`). `POST /images` reads `body.resource.type` after the multipart
parsing, at the write tier, and removes the uploaded file on a refusal; `GET /images/{id}/data`
reads the resource of the stored image, at the read tier.

## Any-scope routes

Marked `allowAnyScope` (`anyScopeRoutes`), because the UIs call them on load and they expose
nothing a tier would restrict: `GET /ping`, `/scopes.json`, `/api-docs.json`,
`/agents/skills/{file}`, `/portals/{id}/public`, `/fonts`, `/fonts/{name}/css`,
`/limits/{type}/{id}`.

In the OpenAPI document an any-scope route is public (`security: []`), except `GET /fonts`, which
lists the fonts of the session's active account: `anyScopeSessionSecurity`, the cookie or a token
whatever its scopes (`{ oauth2: [] }`).

## What stays refused

Fail closed: a route neither guarded nor marked refuses a scoped session (lib-express). Listed on
purpose in `refusedRoutes`: `/admin/*`, `/test-env/*` (dev only), `/identities/*` (secret key),
`POST /limits/{type}/{id}`, `GET /limits`, `POST /portals/{id}/ingress`.

## Publication sites of scoped sessions

Every portal is a publication site in the data-fair settings of its owner, written when a portal
is created, deleted, or changed in a way that changes its publication site
(`syncPortalUpdate` / `syncPortalDelete` in `api/src/portals/service.ts`). data-fair refuses a
scoped token on its settings writes, so the path depends on the session (`syncPath` in
`api/src/portals/operations.ts`):

- unrestricted cookie session (humans): the cookie is forwarded to data-fair's public URL
  (`<origin>/data-fair/api/v1/settings/<type>/<id>/publication-sites`), as before;
- bearer session (an `Authorization` header, scoped or not: a cookie beside it is not the
  credential lib-express read) or scope-restricted session (agents): the write goes to `config.privateDataFairUrl`
  (`PRIVATE_DATA_FAIR_URL`) with the header `x-secret-key: config.secretKeys.dataFair`
  (`SECRET_DATA_FAIR`, data-fair's `secretKeys.portals`), no other identity header. Without both settings the save answers 500 and stores nothing.

Both paths first assert the caller is admin of the portal owner (`assertCanSyncPortal`). The sync
runs before the portal is stored: a data-fair error leaves the portal unchanged. Its message keeps
data-fair's status and message (`data-fair error (401): ...`); the status answered passes data-fair's
400, 403, 404 and 409 through, and turns a 401, a 5xx and a network error into a 502 (`formatSyncError`,
`syncErrorStatus`): those are a failure of portals' call, not of the caller's request. The maintenance scripts (`api/scripts/sync-portals-sd.ts`,
`sync-portals-ingress.ts`) pass no caller: they sync simple-directory or the ingress only, a
data-fair sync without a caller answers 500.

### Subscriptions

On the cookie path data-fair subscribes the user to the events of a new publication site itself.
On the secret-key path it knows no session: when it answers `created` with
`subscriptions`, portals posts them to `<origin>/events/api/v1/subscriptions` with the caller's
own credential (its bearer, else its cookie; `subscriptionRequests`). A failure is only logged
(`subscribe-publication-site`).

## Testing

- The test NHI `test_org1_scope_nhi` (`dev/resources/users.json`, admin of `test_org1` in
  `dev/resources/organizations.json`; simple-directory runs with `MANAGE_NHIS` and
  `NHIS_ALLOW_INSECURE_ISSUERS`): `nhiSession(scope?)` in `tests/support/nhi.ts` signs an
  assertion with `tests/resources/nhi/test-nhi-key.pem` and returns `cookieAx`, `bearerAx` and the
  access token; no scope gives an unrestricted session.
- `tests/features/scopes/`: unit tests of the vocabulary, of the route coverage and of the OpenAPI
  security; API tests of the tiers per family, the body-dependent tiers, images, refused and
  any-scope routes, cookie and bearer sessions.
- `tests/features/portals/publication-site-sync.{unit,api}.spec.ts`: the choice of path and the
  subscriptions (unit); the cookie path and, against `data-fair:master`, the refusal of an agent
  save (api). With `DF_IMAGE` set to a data-fair build that accepts the portals secret key, the
  refusal case is skipped.

## Known gaps

- The secret-key sync needs a data-fair release with `secretKeys.portals`, and portals configured with `SECRET_DATA_FAIR` and `PRIVATE_DATA_FAIR_URL`; until then an agent save that touches a publication site is refused.
- TODO: unify the human path on the secret key once every supported data-fair has it (the cookie path stays for humans meanwhile).
- An agent session's subscriptions to the events of a new publication site are probably refused by events (its token is portals-only); the failure is only logged.
- A page transfer does not update its images' `owner.department` (pre-existing).
