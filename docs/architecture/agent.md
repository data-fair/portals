# The AI assistant in portals

What the assistant is supposed to be able to do in this repository, where its tools
come from, and what the person sees. Written for the simulation judge
(`.claude/agents/simulation-judge.md`) and for anyone changing agent tools.

The chat itself (drawer/menu, conversation, skills, the `wait_for_user_action`
handover, the gateway) belongs to the [agents](https://github.com/data-fair/agents)
service and its libraries `@data-fair/lib-vue-agents` / `@data-fair/lib-vuetify-agents`
(0.7: no sub-agents, a host publishes skills beside its tools). This repository only
**hosts** the chat and **registers tools and skills** for it.

Agents working outside a browser (coding agents, the agents service's autonomous runs) do not
use these tools: they reach the manager API through data-fair's platform OpenAPI document and
OAuth scopes, see [api-docs.md](api-docs.md) and [scopes.md](scopes.md).

## Two surfaces

### Back-office (portal managers)

```
data-fair back-office shell (/data-fair/...)        ← data-fair image
├── chat drawer: iframe /agents/<type>/<id>/chat     ← agents service
└── d-frame: iframe /portals-manager/...             ← this repo's manager UI (ui/)
        └── registers tools via useFrameServer('portals-manager') (ui/src/main.ts)
```

- The data-fair shell renders the chat drawer and its toggle (app bar) only when
  data-fair runs with an agents URL (`PRIVATE_AGENTS_URL`, i.e. `agentsIntegration`)
  **and** the account's data-fair setting `agentChat` is true.
- `/data-fair/pages/...` and `/data-fair/portals/...` embed the manager UI
  (`/portals-manager/pages/...`, `/portals-manager/portals/...`) and keep both URLs in
  sync.
- Tools travel from the manager frame to the chat over a `BroadcastChannel` (frame
  server → aggregator in the chat). When the manager frame's document is discarded
  (navigation, frame removed), it announces `mcp-server-stopped` on `pagehide`
  (`@data-fair/lib-vue-agents` ≥ 0.6.1) so the chat drops its tools. Before that
  version a stale server made the next turn wait out the 60s MCP request timeout
  (`MCP error -32001: Request timed out`).

### Public portal (visitors)

```
portal (Nuxt, <portal>.portals.<host>/...)           ← this repo's portal/
├── chat: DfAgentChatDrawer or DfAgentChatMenu       ← portal/app/components/agent-chat.vue
│        (iframe /agents/<owner type>/<owner id>/chat)
└── tools registered by usePortalAgentHost (portal/app/composables/agent/use-portal-agent-host.ts)
```

- The chat is shown when the portal config has `agentChat.active` and the viewer's
  bucket (`anonymous`, `external`, `user`, `contrib`, `admin` relative to the portal
  owner) is in `agentChat.visibleTo` (no `visibleTo` = everyone). It is mounted
  client-side only, after hydration.
- `agentChat.type` is `menu` (default) or `drawer`.
- The portal's built-in guidance (portal title, owner and origin; never invent data and
  base figures on tool results; check a table on screen with its page filters; open pages
  with `navigate` and read the screen before describing it; absolute markdown links) is
  published on every portal page as keyed host state (`useAgentState`, keys `portal`,
  `portal-data`, `portal-screen`, `portal-links`, built by
  `portal/app/composables/agent/portal-agent-guidance.ts`), which the agents server tells
  the model on every turn. It used to be the chat's system prompt, which agents libs 0.7
  ignore (`hostInitConfig` drops the `systemPrompt` prop: a persona is a configured agent,
  chosen by `agentId`).
- **Known regression since agents libs 0.7: the custom persona.** `agentChat.systemPrompt` and
  the `custom-agent` page block's prompt, focus datasets and page containment are not applied;
  their replacement needs an `agentId`-based configuration, to be decided
  (`tests/features/portal-rendering/custom-agent-block.e2e.spec.ts` is `test.fixme` until then).
- Tools are registered on every portal page, independent of whether the chat is shown.

## Manager tools (back-office)

| Where | Tools | Notes |
|---|---|---|
| Page editor `/pages/<id>/edit-config` (`ui/src/pages/pages/[pageId]/edit-config.vue`) | `pageConfig_*` form tools from `@json-layout/core/webmcp` over the page config form (`ui/src/composables/use-page-config-webmcp.ts`; `edit-simple.vue` through vjsf's `prefix-name`), and their `page-config-form` skill | Covers the page's metadata (title, description, slugs for generic/event/news pages) and its elements (a `oneOf` over every element type, discriminated by `type`). |
| Portal editor `/portals/<id>` (`ui/src/pages/portals/[id]/index.vue`) | `portalConfig_*` form tools of vjsf (`prefix-name="portalConfig_"`) over the portal config form, and their `portal-config-form` skill | Theme (colours, fonts, logos), header, navigation bar, menu, breadcrumb, footer, catalogs, agent chat settings, … |
| Both editors | `DfAgentChatAction` button ("Aide-moi à configurer cette page" / portal equivalent) | Opens the chat with a visible prompt and a hidden context naming the form tools and their skill. |

What the manager tools do **not** cover: creating or deleting a page or a portal
(`/pages/new`, `/portals/new` are plain forms the person fills), validating a draft,
uploading images, and anything outside the open editor. Navigation between
back-office pages is the data-fair shell's own `navigate` tool.

### Drafts

Both editors edit a **draft**. Every change (by the person or by a tool) is saved to
`draftConfig` automatically; the public portal only shows it once the person presses
**« Valider le brouillon »** in the right-hand actions panel (**« Annuler le
brouillon »** discards it). A tool that writes the form has therefore changed the
draft, not the published portal. Pages have no topic (thématique) field: topics
belong to datasets (data-fair settings of the owner).

Only edits are saved: opening an editor saves nothing, even though the form fills in
defaults and the account's topics as it opens, so « Valider le brouillon » stays
disabled until something is changed. A newly created page or portal has nothing to
validate, its draft equal to its configuration; the page editor is still titled
« Édition du brouillon », since edits always go to the draft first.

An incomplete form (a required field empty, as in a menu row just added) is not saved:
the draft keeps its last complete state, and the change is lost if the person leaves the
editor. The editors tell the assistant when the form is incomplete, and when it is
complete again.

A new page is published on no portal. Once it has content (an empty page cannot be
published), the person publishes it with the « Publié » switch of a portal in the page's
« Publications » tab. The portal menu's « Page libre » item only offers pages published on
that portal.

### What the back-office tells the assistant

The page and portal editors, the pages list and the page creation wizard publish their
guidance to the chat as host state (`ui/src/utils/agent-editor-guidance.ts`): how to
reach and edit what is on screen, the draft and its current state, where the menu is
edited, and the wizard's steps. The assistant is told to describe the form with
`<prefix>describeState` before guiding the person click by click, never to guess a label,
and to describe a drop-down's options before naming one — the form tools describe
every option, even one not chosen — and to give all the remaining steps of a section with
several fields in one reply. A page's title and description show only in the editor's
fields, not in the draft preview nor in the breadcrumb before the draft is validated. The page editor has no « Aperçu
(brouillon) » tab: that tab is in the page view. When the person wants to see the result
first, the assistant waits for their go-ahead before asking them to validate.

## Portal tools (visitors)

Registered by `usePortalAgentHost`:

| Tools | Source | Notes |
|---|---|---|
| `list_datasets`, `describe_dataset` | `portal/app/composables/agent/dataset-tools.ts`, schemas from `@data-fair/agent-tools-data-fair` | Catalog search and dataset description, fetched through the portal's own data-fair proxy (`localFetch`), so they see what the portal publishes. |
| `get_dataset_schema`, `search_data`, `aggregate_data`, `calculate_metric`, `get_field_values` and the `query-dataset-data` skill | `dataset-data-tools.ts`, from `@data-fair/agent-tools-data-fair` | Queries, aggregations, metrics and filters on a dataset; the skill says how to combine them. |
| `get_current_location`, `list_pages`, `navigate`, `pageFilters_get`, `pageFilters_set` | `navigation-tools.ts`, `page-filter-describe-tool.ts` | Where the person is, what pages exist, moving them, and reading/setting the filters of the current page. |
| `list_applications`, `list_reuses`, `list_events`, `list_news` | `portal-content-tools.ts` | Portal content listings. |
| `get_user_geolocation`, `geocode_address` | `geo-tools.ts` | Asks the browser for the visitor's position; turns an address into coordinates through the IGN geocoding service (data.geopf.fr, allowed in the portal's CSP). |

Constraints the judge should know:

- `navigate` refuses `/datasets/<ref>/map` for a dataset without geographic data (no
  `bbox`) and points to its table; the map page itself says it cannot show one.
- Portal dataset routes are plural: `/datasets/<ref>`, `/datasets/<ref>/table`,
  `/datasets/<ref>/map` (data-fair's back-office uses singular `/dataset/<id>`).
- In a table/map link, column filters are bare (`type_eq=Piscine`) and work as is;
  the search and geographic filters (`q`, `bbox`, `geo_distance`, `date_match`) must be
  `_c_`-prefixed, unprefixed ones are silently dropped by the embedded view. The data
  query tools print a ready-made `Filter query:` line that follows these rules, to be pasted
  verbatim.
- The table/map itself is data-fair's embedded view in an iframe
  (`/data-fair/embed/dataset/<ref>/table`).
- Table links choose their columns with `cols=` (the parameter the embedded table
  reads), not `select=`.
- These tools are a hand-maintained fork of the data-fair back-office agent tools
  (`data-fair/ui/src/composables/agent/`); only the schemas/builders in
  `@data-fair/agent-tools-data-fair` are shared.

## Simulations

`simulations/` runs judged scenarios on both surfaces; see AGENTS.md (Simulations) and
`docs/qa/simulations-assistant-ia.md` for the latest results.
