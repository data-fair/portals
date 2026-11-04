# OpenAPI document for agents

`GET /portals-manager/api/api-docs.json` serves the OpenAPI 3.1 document of the portals manager,
annotated with `x-agent` for `@data-fair/openapi-mcp`. data-fair fetches it over a private URL and
merges it into its platform document (`/data-fair/api/v1/platform/api-docs.json`, see data-fair's
`docs/architecture/platform-api-docs.md`): that is how coding agents and the agents service's
autonomous runs get portals tools. The back-office and portal chats do not use it, they register
their own browser tools (see [agent.md](agent.md)).

Code: `api/contract/api-docs.ts` (the document), `api/contract/x-agent.ts` (the annotations),
`api/contract/agent-skills.ts` and `api/contract/agent-skills/*.md` (skills), the routes in
`api/src/app.ts`, the draft-config routes in `api/src/draft-configs/`. Authorization:
[scopes.md](scopes.md).

## The document

- Public, identical for every caller (no session read), marked `allowAnyScope`,
  `Cache-Control: public, max-age=300`, varying on `Accept-Language` (the scope descriptions of the
  `oauth2` scheme are in French or English), built once per locale.
- `servers: [{ url: '/portals-manager/api' }]`: no request origin, data-fair prefixes the paths
  itself.
- Security schemes: `sdCookie` and `oauth2` (`oauth2SecurityScheme(vocabulary)`, relative token
  URL `/simple-directory/...`, data-fair sets the one of each site). Portals accepts no API key: no
  `apiKey` scheme.
- Every scoped operation's `security` is built from `scopedOperations` (`api/src/scopes.ts`): the
  cookie and one `{ oauth2: [scope] }` alternative per accepted scope. Public operations
  (`getPublicPortal`, `listFonts`, `getScopes`) have `security: []`.
- Schemas come from `api/doc` and `api/types`, references inlined (`docSchema`), build-only keys
  (`x-*`, `layout`, `$id`...) removed. The configurations of portals and pages are too large for a
  tool body: they are placeholders pointing at the editor tool groups, and a new portal or page
  body only asks for its title (`config.title`, and `config.elements: []` for a page).

## Tools

An operation is a tool only if it carries `x-agent` (`operations` in `x-agent.ts`). Names are
snake_case and short; data-fair prefixes them with `portals_`, and every text (descriptions, tag
guides, skills) names tools by their platform name (`portals_publish_page`). Tool names are a
contract: business skills name them, `tests/fixtures/agent-surface.json` pins them.

An operation whose body raises its tier (`bodyTiers`) is split into views, each offering some body
fields (`bodyFields`); the views offering an admin field are narrowed to the admin tier with
`agentSecurity(family, 'admin')`, so a write token is not offered a tool the API would refuse it:

| Operation | Write-tier view | Admin-tier views |
| --- | --- | --- |
| `PATCH /portals/{id}` | — | `update_portal_settings` (staging, contributorDepartments, owner) |
| `POST /pages` | `create_page` | `create_page_on_portals` |
| `PATCH /pages/{id}` | `update_page` (title) | `attach_page_to_portals`, `request_page_publication`, `transfer_page` |
| `PATCH /reuses/{id}` | `update_reuse` (draftConfig) | `attach_reuse_to_portals`, `request_reuse_publication`, `transfer_reuse` |

List tools fix `select` and declare a concise view (`response.concise`); tags `Portals`, `Pages`
and `Reuses` carry a guide (`tagGuides`) on the draft / live model.

## Editor tool groups

`PUT /portals/{id}/draft-config` (`portal_config`) and `PUT /pages/{id}/draft-config`
(`page_config`) carry `x-agent.editor`: openapi-mcp turns each into eight json-layout form tools
(`<name>_describeState`, `_getData`, `_setFieldValue`, `_setData`, `_getFieldSuggestions`,
`_editArray`, `_saveForm`, `_reloadForm`) and a fill-form skill named after the group
(`page-config`, `portal-config`). See openapi-mcp's `docs/editor-tool-groups.md`.

The routes behind them (`api/src/draft-configs/`), scoped like the rest:

- `GET .../draft-config` (`readOperation`) answers exactly what the `PUT` accepts. Page drafts are
  healed on read and write as the page editors do (page-config `validate`, `removeAdditional`):
  leftovers of an element type switch are stripped. An unknown root key of a page draft `PUT` is
  refused (400 naming it).
- `PUT .../draft-config` saves the whole draft through `patchPage` / `patchPortal`, as the
  editors' saves do (markdown rendering included).
- `GET .../draft-config/schema` (`schemaOperation`) serves a self-contained form schema: every
  referenced schema bundled in `$defs` (`bundleSchema`), and the form context baked into the layout
  expressions (`bakeContext`): the page type; for the portal its owner, white label and the
  simplified theme; no admin mode and empty lists of pages to link to. Cached `private,
  max-age=300`.

## Skills

Root `x-agent.skills`, bodies in `api/contract/agent-skills/<name>.md`, served publicly as
markdown at `GET /portals-manager/api/agents/skills/<name>.md` (`href` relative to the document
URL). A skill is offered while one of its `tools` is:

- `pages`: the page model (draft and live, publication and attachment to portals, owners and
  roles, page types and standard pages, slugs, groups, blocks, embeds, diagrams);
- `config`: the portal configuration model (draft and live, settings, what a save syncs to
  data-fair and simple-directory, theme, fonts, images, menu, footer...).

`upload_image` is in neither list: it would offer the portals skill to a pages or reuses token.
The form mechanics are in the editor groups' skills; page design knowledge lives in the platform
registry's skills, not here.

## How data-fair merges it

| Field | Value |
| --- | --- |
| namespace (id) | `portals` |
| title | `Portals` |
| mount path | `/portals-manager/api` |
| public document path | `/portals-manager/api/api-docs.json` |
| private URL | data-fair's `privatePortalsManagerUrl` (`PRIVATE_PORTALS_MANAGER_URL`) + `/api/api-docs.json` |

Paths become `/portals-manager/api/...`, operationIds and tool names `portals_<name>`, the root
skills `portals-pages` and `portals-config` (`href`s resolved against the public document path);
openapi-mcp names the editor groups' skills after their merged tool names, `portals-page-config`
and `portals-portal-config`.

## Testing

- `tests/features/agent-tools/api-docs-agent-surface.unit.spec.ts`: loads the document with
  openapi-mcp under `lint: 'error'` and compares the tools and skills each scope set reaches with
  the golden `tests/fixtures/agent-surface.json` (regenerate with `UPDATE_AGENT_SURFACE=1` when the
  change is intended).
- `tests/features/scopes/scopes-openapi.unit.spec.ts`: the x-agent keys are openapi-mcp's, every
  scope used is declared, every scoped operation is in the document, operationIds are unique.
- `tests/features/agent-tools/api-docs.api.spec.ts`: the document and the skill bodies are served
  anonymously and to any scope.
- `tests/features/draft-configs/config-schemas.unit.spec.ts`, `tests/features/pages/draft-config.api.spec.ts`,
  `tests/features/portals/draft-config.api.spec.ts`: the bundled schemas and the draft-config routes.

## Known gaps

- `getFieldSuggestions` of the editor groups fails for page groups and topics: `@json-layout/core` resolves their `/…` URLs against a placeholder origin in Node (upstream fix).
- The page link pickers have no suggestions in editor sessions (the baked context has empty page lists).
- The portal-config and reuse-config validators ignore `unevaluatedProperties`: unknown keys are accepted.
- Merge into data-fair's platform document not yet verified end to end (needs data-fair with the `portals` entry).
