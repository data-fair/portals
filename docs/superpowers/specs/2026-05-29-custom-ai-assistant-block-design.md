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

> Note: portals has **no** `reactiveSearchParams` composable (unlike data-fair's
> `dataset-table-agent-tools.ts`). The equivalent reactive params object in
> portals is the **vue-router query**, synced by the d-frame adapter. The
> page-params tools therefore operate on the router query.

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
- **Page-params tools home:** registered page-scoped, from the page-render root.
- **Block schema home:** in `api/types/page-element-functional/schema.js`.
- **Param tools scope:** all useful operations (read/describe/set/clear),
  operating on the router query (portals' reactive params equivalent), modeled
  after data-fair's `dataset-table-agent-tools.ts`.

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

- **New** `portal/app/composables/agent/page-params-tools.ts` using
  `useAgentTool` from `@data-fair/lib-vue-agents`, modeled on data-fair's
  `dataset-table-agent-tools.ts`. Operates on `useRouter()` / `useRoute().query`.
- **Registered from** `portal/app/components/page-elements.vue` when `root`
  (so it mounts/unmounts with the page and only the active page's filters are
  exposed). It receives the page `elements` array to know what's filterable.
- Tools:
  - `describe_page_filters` — scan `elements` for blocks using `shared-filters`
    syncParams; report the filterable datasets (`_d_<id>_`) and that page-wide
    concept filters (`_c_*`) are available, with the dataset ids/titles.
  - `get_page_filters` — read current `_c_*` and `_d_<id>_*` keys/values from
    the router query.
  - `set_page_filter` — push a router-query update for a concept (`_c_…`) or a
    per-dataset (`_d_<id>_…`) filter; the d-frame adapter propagates it to all
    embeds bound to that param.
  - `clear_page_filter` — remove a specific filter key (or all page filters).

  Tool names are namespaced (e.g. `pageFilters_*`) to avoid collision with the
  base tools.

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

**Component** — `portal/app/components/page-element/functional/page-element-custom-agent.vue`:
- Compose the effective system prompt:
  block `systemPrompt`
  + shared portal context (domain / owner name / portal title — same suffix the
    global agent adds; extract to a small shared helper to avoid duplication)
  + focus-datasets line (titles + ids; "focus your data exploration on these
    unless explicitly asked to look beyond them")
  + containment line ("your work is contained in this page; do not navigate away
    unless the user explicitly asks").
- Build URL via `resolveAgentChatUrl({ accountType: owner.type,
  accountId: owner.id, chatTitle: title, systemPrompt })`.
- Render a flat `<d-frame>` (not a drawer) at the configured `height`, with `mb`
  spacing, and route the iframe's `navigate` message to the router (reuse the
  handling pattern from `useAgentChatBase.ts`).
- Wire into `page-element.vue`:
  `<page-element-custom-agent v-else-if="element.type === 'custom-agent'" :element="element" />`
  in the Functional blocks group.

**Types/build:** run `npm run build-types` after schema edits.

## Data flow

1. Portal loads → `app.vue` mounts `usePortalAgentHost` → base tools live on the
   tab BroadcastChannel (independent of `agentChat.active`).
2. User opens a page → `page-elements.vue` (root) mounts `page-params-tools` →
   page filter tools added to the channel; unmounted on page leave.
3. A custom-agent block renders its own chat iframe → its
   `FrameClientAggregator` discovers the host server + sees base tools + page
   filter tools (same as the global agent would).
4. Agent calls `set_page_filter` → router query updated → d-frame adapter
   propagates to embedded previews/apps bound to `_c_*` / `_d_<id>_*`.

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
- **Tool name collisions** across base + page-params tools — namespace the new
  tools.
- **Always-on host cost** on tool-less pages — negligible, but confirm no SSR
  issues (host runs client-only).

## Out of scope (v1)

- Per-agent tool isolation / dedicated BroadcastChannel per agent.
- Hard dataset restriction at the tool or iframe level.
- Config toggle to disable navigation for the block.
- Any agents-service code change.

## Affected files

**Portals — new**
- `portal/app/composables/agent/use-portal-agent-host.ts`
- `portal/app/composables/agent/page-params-tools.ts`
- `portal/app/components/page-element/functional/page-element-custom-agent.vue`

**Portals — modified**
- `portal/app/app.vue` (mount host)
- `portal/app/components/agent-chat.vue` (remove tool registration; keep display)
- `portal/app/components/page-elements.vue` (register page-params tools at root)
- `portal/app/components/page-element/page-element.vue` (map `custom-agent`)
- `api/types/page-element-functional/schema.js` (new `element-custom-agent` def)
- `api/types/page-elements/schema.js` (oneOf `$ref` + oneOfItems label)

**Agents service**
- None.
