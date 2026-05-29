# Custom AI Assistant page block — Design

Date: 2026-05-29
Branch: `feat-agent-block`
Status: approved design, pre-implementation

## Goal

Add a new page block — a **Custom AI Assistant** (working name) — that embeds a
topical AI agent scoped to the context of a single page. It reuses the existing
portal-level agent infrastructure (agents-service iframe + WebMCP-over-
BroadcastChannel tools) but is rendered inline as a flat block, with its own
title and prompt, a curated focus on a subset of datasets, and instructions to
stay within the page.

A second, related goal: expose **page query-parameter tools** (read/describe/
set/clear the `_c_` concept filters and `_d_<datasetId>_` dataset filters that
are synced with embedded apps and previews). These are *not* specific to the new
block — they are declared in the context of the page and therefore available to
**both** the custom-agent block and the global portal agent.

## Background (current state)

### Portal-level agent
- Config: `api/types/portal-config/schema.js` → `agentChat` (`active`,
  `visibleTo`, `type` drawer|menu, `chatTitle`, `systemPrompt`, drawer/menu/btn
  props).
- Render: `portal/app/components/agent-chat.vue` mounts
  `DfAgentChatDrawer`/`DfAgentChatMenu`/`DfAgentChatToggle` from
  `@data-fair/lib-vuetify-agents`. It builds the embedded URL via
  `resolveAgentChatUrl({ accountType, accountId, chatTitle, systemPrompt })`
  (`/agents/{type}/{id}/chat?title=…&systemPrompt=…`).
- Tools: registered host-side **inside `agent-chat.vue`** (lines 110-131) within
  an `effectScope`, gated on `agentChat.active && canSee`:
  `useFrameServer('portal')` + `useAgentDatasetTools`,
  `useAgentDatasetDataTools`, `useAgentNavigationTools`, `useAgentGeoTools`,
  `useAgentPortalContentTools`.

### Agents service (the embedded iframe)
- Chat page `ui/src/pages/[type]/[id]/chat.vue` reads `title` + `systemPrompt`
  from the URL query (lines 35-36) and passes them to `AgentChat.vue`.
- Tools are discovered dynamically: the chat iframe runs `FrameClientAggregator`
  on the tab BroadcastChannel (`getTabChannelId()`), connects to every
  `FrameServerTransport` that broadcasts ready, and aggregates all their tools.
  **There is no per-agent tool isolation** — every agent on the tab sees the
  same aggregated toolset.
- Per-iframe messages (`agent-status`, `tools-changed`, `navigate`, `unread`)
  flow over the d-frame `@message` channel, scoped to each iframe. Only
  `agent-chat-ready` / `agent-start-session` / ping-pong use the shared
  BroadcastChannel.

### Page blocks
- Discriminated union on `type` in `api/types/page-elements/schema.js` (`oneOf`
  of `$ref`s + `oneOfItems` labels grouped by category). 38 element types
  (keys 0-37).
- Per-category schema files (e.g. `api/types/page-element-functional/schema.js`
  holds search/topics/metrics/contact).
- Render: `portal/app/components/page-element/page-element.vue` maps
  `element.type` → component via `v-if`/`v-else-if`. `page-elements.vue` loops
  the elements array (root + recursive children).
- Param sync: embedded previews/apps use `d-frame-wrapper.vue`, whose
  `createDFrameAdapter(useRouter())` syncs the **vue-router query** ↔ iframes.
  `syncParams` patterns: `sandboxed` = `*:<uuid>_`; `shared-filters` =
  `_c*,*_*:_d_<datasetId>_,*:<uuid>_` (concept filters `_c*` + per-dataset
  filters `_d_<id>_` + element-scoped `<uuid>_`).

> Note: portals **does** provide a `reactiveSearchParams` object — the same
> `@data-fair/lib-vue/reactive-search-params.js` data-fair uses. It is installed
> app-wide by `portal/app/plugins/reactive-search-params.ts`
> (`createReactiveSearchParams(router)`) and accessed via the exported composable
> `useReactiveSearchParams()`. It is a flat **reactive `{ key: value }`
> object** seeded from and two-way-synced with the vue-router query: mutating a
> key writes through to the router, and the d-frame adapter
> (`@data-fair/frame/lib/vue-router/state-change-adapter.js`) propagates router
> changes to the embedded apps/previews. **The page-params tools operate on this
> `reactiveSearchParams` object** (per user direction), mirroring data-fair's
> table-page search-param agent tools, rather than poking the router directly.

## Decisions (from brainstorming)

- **Tool isolation:** none — single shared toolset for all agents on the tab.
  → No agents-service change needed in v1.
- **Dataset curation:** prompt-only (focus datasets injected into the block's
  system prompt; tools always see the full catalog).
- **Navigation:** block reuses the same navigation tools; its prompt instructs
  it to stay on the page and only navigate when the user explicitly asks.
- **Tool availability vs. display:** tools are **always** registered via WebMCP
  (always-mounted host). The `agentChat.active` toggle gates **only** the global
  chat's display, not tool availability.
- **Page-params tools split:**
  - **`describe` is per-block** — each `shared-filters`-enabled block registers
    one tool describing itself (the block + the filter keys it honors). This
    replaces a central element-scanning `describe_page_filters` and co-locates
    discovery with the block that already knows its `uuid` / dataset id.
  - **`get` / `set` are global** — two page-scoped tools on
    `reactiveSearchParams` (provided app-wide by
    `portal/app/plugins/reactive-search-params.ts`), registered once. Modeled on
    data-fair's table-page search-param agent tools (get + set, where an
    empty/null value in set clears the key).
- **Concept filters:** per-element only — no separate page-wide concept tool.
  Each block's describe covers both its concept (`_c_*`) and per-dataset
  (`_d_<id>_*`) keys; setting a `_c_` key via the global set tool naturally
  affects every block honoring it (it's shared).
- **Block schema home:** in `api/types/page-element-functional/schema.js`.

## Architecture

Three independent pieces.

### Piece 1 — Always-on agent host (refactor)

Move host-side tool registration out of `agent-chat.vue` so tools exist
regardless of the global chat toggle.

- **New** `portal/app/composables/agent/use-portal-agent-host.ts`: encapsulates
  `useFrameServer('portal')` + the five `useAgent*Tools(...)` calls (lifted
  verbatim from `agent-chat.vue`). Accepts the same inputs
  (`localeRef`, `localFetch`, `portalConfig`, `portalId`, `navigationStore`).
- **`portal/app/app.vue`:** call `usePortalAgentHost(...)` inside `<ClientOnly>`,
  unconditionally. (Negligible cost on pages with no agent; tools simply sit on
  the channel unused.)
- **`portal/app/components/agent-chat.vue`:** delete the `toolsScope` /
  registration block (lines ~110-131) and its imports. Keep only the
  toggle-gated drawer/menu display and the global `systemPrompt` computed
  (domain/owner/title context + navigate-to-filtered-view hint).

### Piece 2 — Page-context param tools

Two parts: **global get/set** (registered once per page) and **per-block
describe** (each `shared-filters` block self-registers).

**Global get/set** — new
`portal/app/composables/agent/page-params-tools.ts` using `useAgentTool` from
`@data-fair/lib-vue-agents`, modeled on data-fair's table-page search-param
agent tools. Gets the params object via `useReactiveSearchParams()`
(from `@data-fair/lib-vue/reactive-search-params.js`); the reactive object
handles router + d-frame propagation.
- Registered from `portal/app/components/page-elements.vue` when `root` (mounts/
  unmounts with the page). Because it calls `useReactiveSearchParams()` (which
  injects), registration must happen in a component setup with the plugin
  installed (page-elements.vue qualifies).
- `get_page_filters` — return the current `_c_*` and `_d_<id>_*` keys/values
  from `reactiveSearchParams`.
- `set_page_filters` — accept a `params` map (`{ key: value }`); for each entry
  assign the key on `reactiveSearchParams` (empty/null value `delete`s the key —
  covers both **set** and **clear**).

**Per-block describe** — new composable
`portal/app/composables/agent/page-filter-describe-tool.ts` (`useAgentTool`),
called by each `shared-filters`-capable block component **only when**
`element.syncParams === 'shared-filters'`:
- `page-element-dataset-table.vue` — honors `_c_*` + its own
  `_d_<datasetId>_*`; describe = block type + dataset title/id + those key
  prefixes. (`page-element-dataset-download.vue` is excluded: no `syncParams`
  enum in its schema, so no `shared-filters` mode to advertise.)
- `page-element-application.vue` — honors `_c_*` + all `_d_*`; describe = app
  title + that it reflects all page concept/dataset filters.
- Each tool is uniquely named per block (e.g. `describe_filters_<uuid>`, with a
  human `title` annotation) so multiple describe tools on one page don't
  collide. The tool returns a short static description (block label + the filter
  keys it accepts) so the agent knows what to pass to `set_page_filters`.

**Naming:** global tools namespaced (e.g. `pageFilters_get` / `pageFilters_set`)
to avoid collision with the base `*_dataset_*` tools.

### Piece 3 — Custom-agent block

**Schema** — add `$defs/element-custom-agent` to
`api/types/page-element-functional/schema.js`:
- `type: { const: 'custom-agent' }`, `uuid` (`layout: 'none'`)
- `title` — header / iframe title (string)
- `systemPrompt` — topical prompt (string, markdown/textarea layout)
- `focusDatasets` — array of `{ id, title }`, multi-select via the same
  `getItems` autocomplete used by dataset-card
  (`/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title&size=20&sort=updatedAt:-1`)
- `height` — integer px, default 500, minimum ~200
- `mb` — `$ref` page-elements-defs margin-bottom

Register in `api/types/page-elements/schema.js`:
- Append the `$ref`
  `https://github.com/data-fair/portals/page-element-functional#/$defs/element-custom-agent`
  at the **end** of the `oneOf` array (so its discriminator index is 38 — no
  renumbering of existing keys 0-37).
- Add a matching `oneOfItems` entry `{ key: 38, title: 'Custom AI assistant',
  'x-i18n-title': { fr: 'Assistant IA personnalisé' } }` under the existing
  "Functional blocks" header.

**Component** — `portal/app/components/page-element/functional/page-element-custom-agent.vue`
(thin wrapper; rendering/URL/navigation live in the lib's `DfAgentChatBlock`):
- Compose the effective system prompt:
  block `systemPrompt`
  + shared portal context (domain / owner name / portal title — same suffix the
    global agent adds; extract to a small shared helper to avoid duplication)
  + focus-datasets line (titles + ids; "focus your data exploration on these
    unless explicitly asked to look beyond them")
  + containment line ("your work is contained in this page; do not navigate away
    unless the user explicitly asks").
- Render `<DfAgentChatBlock :account-type="owner.type" :account-id="owner.id"
  :chat-title="title" :system-prompt="systemPrompt" :height="height">` in a
  `mb`-spaced wrapper. The lib component resolves the chat URL and handles the
  iframe's `navigate` message internally — the portal carries no raw `<d-frame>`
  / `resolveAgentChatUrl` / navigate logic.
- Wire into `page-element.vue`:
  `<page-element-custom-agent v-else-if="element.type === 'custom-agent'" :element="element" />`
  in the Functional blocks group.

**Types/build:** run `npm run build-types` after schema edits.

## Data flow

1. Portal loads → `app.vue` mounts `usePortalAgentHost` → base tools live on the
   tab BroadcastChannel (independent of `agentChat.active`).
2. User opens a page → `page-elements.vue` (root) registers global
   `pageFilters_get` / `pageFilters_set`; each `shared-filters` block registers
   its own `describe_filters_<uuid>`. All added to the channel; unmounted on
   page leave / block removal.
3. A custom-agent block renders its own chat iframe → its
   `FrameClientAggregator` discovers the host server + sees base tools + the
   global filter tools + the per-block describe tools (same as the global agent).
4. Agent calls a block's `describe_filters_<uuid>` to learn the keys, then
   `pageFilters_set` → keys assigned on `reactiveSearchParams` → router query
   updated → d-frame adapter propagates to embedded previews/apps bound to
   `_c_*` / `_d_<id>_*`.

## Risks / validations

- **Multiple chat instances on one BroadcastChannel** (global drawer + one or
  more blocks): per-iframe messages are isolated, but `agent-chat-ready` /
  `agent-start-session` are broadcast. Verify a block instance does not hijack
  the global drawer's auto-open, and that two blocks on one page don't interfere.
  (Blocks don't use the toggle machinery, so likely fine — must be confirmed.)
- **systemPrompt URL length** with many focus datasets — pass ids/titles
  compactly; keep bounded. If it grows too large for a query string, fall back
  to posting the prompt to the iframe via d-frame message after load (defer
  unless needed).
- **Prompt-only focus & containment are soft** by design (accepted).
- **Tool name collisions** across base + page-params + per-block describe tools
  — namespace the global tools; suffix describe tools with the block `uuid`.
- **Always-on host cost** on tool-less pages — negligible, but confirm no SSR
  issues (host runs client-only).

## Out of scope (v1)

- Per-agent tool isolation / dedicated BroadcastChannel per agent.
- Hard dataset restriction at the tool or iframe level.
- Config toggle to disable navigation for the block.
- Any agents-**service** (runtime) code change. (The agents **lib**
  `@data-fair/lib-vuetify-agents` does get a new `DfAgentChatBlock` component —
  see Piece 3 — but the chat runtime/embed page is unchanged.)

## Affected files

**Portals — new**
- `portal/app/composables/agent/use-portal-agent-host.ts`
- `portal/app/composables/agent/page-params-tools.ts` (global get/set)
- `portal/app/composables/agent/page-filter-describe-tool.ts` (per-block describe)
- `portal/app/components/page-element/functional/page-element-custom-agent.vue`

**Portals — modified**
- `portal/app/app.vue` (mount host)
- `portal/app/components/agent-chat.vue` (remove tool registration; keep display)
- `portal/app/components/page-elements.vue` (register global get/set at root)
- `portal/app/components/page-element/datasets/page-element-dataset-table.vue`
  (register describe tool when shared-filters)
- `portal/app/components/page-element/applications/page-element-application.vue`
  (register describe tool when shared-filters)
- `portal/app/components/page-element/page-element.vue` (map `custom-agent`)
- `api/types/page-element-functional/schema.js` (new `element-custom-agent` def)
- `api/types/page-elements/schema.js` (oneOf `$ref` + oneOfItems label)

**Agents lib (`@data-fair/lib-vuetify-agents`, via `agents_feat-custom-agent` worktree)**
- `lib-vuetify/DfAgentChatBlock.vue` (new inline chat component)
- `lib-vuetify/index.ts` (export it)
- version bump + publish; portal `package.json` bumps the dependency

**Agents service (runtime / embed page)**
- None.
