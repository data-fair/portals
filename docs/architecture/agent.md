# The AI assistant in portals

What the assistant is supposed to be able to do in this repository, where its tools
come from, and what the person sees. Written for the simulation judge
(`.claude/agents/simulation-judge.md`) and for anyone changing agent tools.

The chat itself (drawer/menu, conversation, sub-agents, the `wait_for_user_action`
handover, the gateway) belongs to the [agents](https://github.com/data-fair/agents)
service and its libraries `@data-fair/lib-vue-agents` / `@data-fair/lib-vuetify-agents`.
This repository only **hosts** the chat and **registers tools** for it.

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
- `agentChat.type` is `menu` (default) or `drawer`; `agentChat.systemPrompt` is
  prepended to the context built by `portal/app/composables/agent/portal-prompt-context.ts`
  (portal title, owner, available pages and features).
- Tools are registered on every portal page, independent of whether the chat is shown.

## Manager tools (back-office)

| Where | Tools | Notes |
|---|---|---|
| Page editor `/pages/<id>/edit-config` (`ui/src/pages/pages/[pageId]/edit-config.vue`) | `pageConfig_*` from `@json-layout/core/webmcp` over the page config form (`ui/src/composables/use-page-config-webmcp.ts`), including a sub-agent (`includeSubAgent`) | Covers the page's metadata (title, description, slugs for generic/event/news pages) and its elements (a `oneOf` over every element type, discriminated by `type`). |
| Portal editor `/portals/<id>` (`ui/src/pages/portals/[id]/index.vue`) | `portalConfig_form` sub-agent over the portal config form | Theme (colours, fonts, logos), header, navigation bar, menu, breadcrumb, footer, catalogs, agent chat settings, … |
| Both editors | `DfAgentChatAction` button ("Aide-moi à configurer cette page" / portal equivalent) | Opens the chat with a visible prompt and a hidden context naming the tool to use. |

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

A new page is published on no portal. Once it has content (an empty page cannot be
published), the person publishes it with the « Publié » switch of a portal in the page's
« Publications » tab. The portal menu's « Page libre » item only offers pages published on
that portal.

### What the back-office tells the assistant

The page and portal editors, the pages list and the page creation wizard publish their
guidance to the chat as host state (`ui/src/utils/agent-editor-guidance.ts`): how to
reach and edit what is on screen, the draft and its current state, where the menu is
edited, and the wizard's steps. The assistant is told to have the form sub-agent
describe the form before guiding the person click by click, never to guess a label.

## Portal tools (visitors)

Registered by `usePortalAgentHost`:

| Tools | Source | Notes |
|---|---|---|
| `list_datasets`, `describe_dataset` | `portal/app/composables/agent/dataset-tools.ts`, schemas from `@data-fair/agent-tools-data-fair` | Catalog search and dataset description, fetched through the portal's own data-fair proxy (`localFetch`), so they see what the portal publishes. |
| `dataset_data` | `dataset-data-tools.ts` | Data sub-agent: queries, aggregations, filters on a dataset. |
| `get_current_location`, `list_pages`, `navigate`, `pageFilters_get`, `pageFilters_set` | `navigation-tools.ts`, `page-filter-describe-tool.ts` | Where the person is, what pages exist, moving them, and reading/setting the filters of the current page. |
| `list_applications`, `list_reuses`, `list_events`, `list_news` | `portal-content-tools.ts` | Portal content listings. |
| `get_user_geolocation` | `geo-tools.ts` | Asks the browser for the visitor's position. |

Constraints the judge should know:

- `navigate` refuses `/datasets/<ref>/map` for a dataset without geographic data (no
  `bbox`) and points to its table; the map page itself says it cannot show one.
- Portal dataset routes are plural: `/datasets/<ref>`, `/datasets/<ref>/table`,
  `/datasets/<ref>/map` (data-fair's back-office uses singular `/dataset/<id>`).
- In a table/map link, column filters are bare (`type_eq=Piscine`) and work as is;
  the search and geographic filters (`q`, `bbox`, `geo_distance`, `date_match`) must be
  `_c_`-prefixed, unprefixed ones are silently dropped by the embedded view. The data
  sub-agent returns a ready-made `filterQuery` that follows these rules.
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
