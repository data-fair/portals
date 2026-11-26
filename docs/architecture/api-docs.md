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
| `POST /pages` | `create_page` | — (`portals` not offered: attach with `update_page_settings`) |
| `PATCH /pages/{id}` | — (the back-office `title` is not offered) | `update_page_settings` (portals, requestedPortals, owner) |
| `PATCH /reuses/{id}` | `update_reuse` (draftConfig) | `update_reuse_settings` (portals, requestedPortals, owner) |

Attaching, requesting a publication and transferring are one admin view per resource rather than one
tool each: they share the operation and the tier, and the approval card tells them apart by the field
sent. Left to the back-office (no tool): `getGroup` (the list returns the same), `deleteGroup`,
`deleteFontAsset`, the back-office title of a page.

The writes that name their target by an opaque id carry checked labels (openapi-mcp `labels`, 0.13):
beside `id` the tool takes the target's title (`pageTitle`, `portalTitle`, `reuseTitle`),
beside `portals` / `requestedPortals` the portals' titles in the same order. Before the call the tool
reads each target (`getPage`, `getPortal`, `getReuse`, with the call's own token) and
refuses the call, nothing sent, on a title mismatch; the API receives the call without the labels.
Their inputs carry `x-checked`, which the agents' approval card and reviewer show as a checked fact:
"page « Accueil » on portal « Portail de test »" rather than two uuids. Labelled: the publish,
cancel-draft and delete tools of portals, pages and reuses, the three `update_*_settings` and
`submit_reuse`. A portal title is read with `getPortal`, which the pages and reuses admin tiers may call ([scopes.md](scopes.md)).

List tools fix `select` and declare a concise view (`response.concise`); tags `Portals`, `Pages`
and `Reuses` carry a guide (`tagGuides`) on the draft / live model.

## Editor tool groups

`PUT /portals/{id}/draft-config` (`portal_config`) and `PUT /pages/{id}/draft-config`
(`page_config`) carry `x-agent.editor`: openapi-mcp makes them the two forms of one group of eight
json-layout form tools (`form_describeState`, `form_getData`, `form_setFieldValue`, `form_setData`,
`form_getFieldSuggestions`, `form_editArray`, `form_saveForm`, `form_reloadForm`), each taking
`form` (`portal_config` | `page_config`) and `id`, and one fill-form skill, `form`. A token granted
only one of the forms sees `form` narrowed to it.

In the platform the form tools are not this document's: the mcp server loads data-fair's merged
document, whose editor operations (portals', and later other services') make one group. The tools keep
their bare names, `form_<verb>`, without the `portals_` prefix, and the forms take the merged tool names,
`portals_portal_config` and `portals_page_config`. Texts name them that way: `form_saveForm` with form
"portals_page_config". The skill is served as `form`. The form tools are in neither root skill's
`tools`: a token granted one form would be offered both skills. See openapi-mcp's `docs/editor-tool-groups.md`.

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
The form mechanics are in the `form` skill; page design knowledge lives in the platform
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
The label reads (`labels.*.operation`) name operationIds, so they must follow the same prefix
(`portals_getPage`), like the editor's `schemaOperation` / `readOperation`; data-fair keeps the
`labels` key only from a version that knows it (an older merge drops it with a warning, and the tools
work unlabelled).

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
