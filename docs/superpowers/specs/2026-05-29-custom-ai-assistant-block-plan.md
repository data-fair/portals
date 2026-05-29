# Custom AI Assistant page block — Implementation Plan

Design: `docs/superpowers/specs/2026-05-29-custom-ai-assistant-block-design.md`
Branch: `feat-agent-block`

## Overview

Three independent deliverables, ordered so each is verifiable before the next:

1. **Always-on agent host** — lift the WebMCP frame server + base tool
   registration out of `agent-chat.vue` into an always-mounted host, so tools
   exist regardless of the global-chat toggle.
2. **Page-context filter tools** — global `get`/`set` on `reactiveSearchParams`
   (registered once per page) + a per-block `describe` tool self-registered by
   each `shared-filters` block.
3. **Custom-agent block** — new `custom-agent` page element rendering a flat
   `<d-frame>` chat with a composed title + topical prompt.

Steps 1 and 2 are independently shippable and testable before step 3 exists.

## Cross-cutting gotchas (read before starting)

- **`useAgentTool` needs `navigator.modelContext` + an effect scope.** It
  registers via `navigator.modelContext.registerTool` and uses
  `onScopeDispose` for cleanup (`node_modules/@data-fair/lib-vue-agents/use-agent-tools.js`).
  So every registration must run **after** `useFrameServer('portal')` (which
  installs the BrowserMcpServer onto `navigator.modelContext`) and **inside** a
  Vue effect scope (component setup or an explicit `effectScope()`).
- **SSR safety.** `useFrameServer` touches `BroadcastChannel`/`navigator`
  directly — it must run **client-only**. `useAgentTool` already no-ops when
  `navigator` is undefined, but the host mount must still be client-guarded.
- **`reactiveSearchParams` injection identity.** The app plugin provides the
  object using the Symbol from **`@data-fair/lib-vue/reactive-search-params.js`**
  (`portal/app/plugins/reactive-search-params.ts`). `@data-fair/lib-vue-agents`
  re-exports its *own* `useReactiveSearchParams` from a *separate* copy with a
  *different* Symbol — using that one would inject `undefined`. **Import
  `useReactiveSearchParams` from `@data-fair/lib-vue/reactive-search-params.js`**
  (the same module the plugin uses), not from lib-vue-agents.

## Implementation Steps

### Step 1: Extract the always-on agent host

**Goal:** Base tools are registered on the tab channel whenever the portal is
loaded (client-side), independent of `agentChat.active`.

**Files:**
- `portal/app/composables/agent/use-portal-agent-host.ts` — **new**. Exports
  `usePortalAgentHost(opts)` that runs `useFrameServer('portal')` then the five
  existing `useAgent*Tools(...)` calls, lifted verbatim from `agent-chat.vue`
  (dataset, dataset-data, navigation, geo, portal-content). Same inputs:
  `localeRef`, `localFetch`, `portalConfig`, `portalId`, `navigationStore`.
- `portal/app/app.vue` — mount the host once, client-only, inside an
  `effectScope` so `useAgentTool`'s `onScopeDispose` has a scope. Pass the same
  values `agent-chat` currently passes (`$portal.config`, `$portal._id`,
  `$portal.owner`, locale, `$localFetch`).
- `portal/app/components/agent-chat.vue` — **remove** the `toolsScope` /
  `watchEffect` registration block (lines ~110-131) and the now-unused tool
  imports + `useFrameServer`. Keep the toggle-gated drawer/menu display and the
  `systemPrompt` computed.

**Approach:**
- Mount choice: prefer mounting inside `app.vue` under a client guard
  (`import.meta.client`) wrapped in `effectScope().run(...)`, rather than a Nuxt
  plugin, so it sits in the component tree alongside the existing agent-chat and
  has stores/`useNuxtApp` available. The host never unmounts during a session;
  the effectScope exists only to satisfy `onScopeDispose`.
- Keep the order: `useFrameServer('portal')` **first**, then the tool
  composables (matches current working order).

**Verify:**
- With `agentChat.active = false`, open a page and confirm in devtools that
  `navigator.modelContext` has the base tools registered (or that the existing
  `page-edit-webmcp` style check sees them). Tools must be present with the
  global chat hidden.
- With `agentChat.active = true`, the drawer/menu still appears and still works
  (existing `agent-chat-visibility.e2e.spec.ts` passes).

### Step 2a: Global page-filter get/set tools

**Goal:** Two page-scoped tools let any agent read and write the page's synced
filter params.

**Files:**
- `portal/app/composables/agent/page-params-tools.ts` — **new**. Exports
  `usePageParamsTools()`. Imports `useReactiveSearchParams` from
  `@data-fair/lib-vue/reactive-search-params.js` (see gotcha). Registers:
  - `pageFilters_get` — no input; returns current keys matching `_c_*` /
    `_d_*` from the reactive params object.
  - `pageFilters_set` — input `{ params: object }`; for each entry assign the
    key (empty/null/`''` ⇒ `delete` the key). Mutation flows through the
    reactive object → router → d-frame adapter.
- `portal/app/components/page-elements.vue` — call `usePageParamsTools()` once
  when `root` (component setup is a valid scope; plugin is installed app-wide so
  the inject resolves).

**Approach:**
- Filter the reported keys to the `_c_`/`_d_` prefixes so the agent isn't
  handed unrelated router params.
- Descriptions should tell the agent to first call a block's `describe` tool to
  learn valid keys.

**Verify:**
- Unit/e2e: on a page with a `shared-filters` dataset-table, have the tool set
  a `_d_<id>_<field>_eq` key and confirm the embedded table reacts (URL query
  updates; iframe receives it). `pageFilters_get` returns the set value.

### Step 2b: Per-block describe tool

**Goal:** Each `shared-filters` block advertises itself + the filter keys it
accepts.

**Files:**
- `portal/app/composables/agent/page-filter-describe-tool.ts` — **new**. Exports
  `usePageFilterDescribeTool({ uuid, label, keys })` registering one tool named
  `describe_filters_${uuid}` with a human `title`, returning a short static
  description (block label + accepted key prefixes).
- `portal/app/components/page-element/datasets/page-element-dataset-table.vue`
  and `.../page-element-dataset-download.vue` — call it when
  `element.syncParams === 'shared-filters'`, advertising `_c_*` +
  `_d_<dataset.id>_*`.
- `portal/app/components/page-element/applications/page-element-application.vue`
  — call it when `element.syncParams === 'shared-filters'`, advertising `_c_*` +
  all `_d_*` (the app reflects every page filter).

**Approach:**
- Register only in the `shared-filters` case (guard before calling). Component
  setup is the scope; the tool unregisters automatically when the block unmounts
  (e.g. block deleted in editor, or page change).
- Unique per-`uuid` name avoids collisions when multiple blocks coexist.

**Verify:**
- Page with two `shared-filters` blocks → two `describe_filters_<uuid>` tools
  visible to the agent; a `sandboxed`/`none` block registers none.

### Step 3: Custom-agent block

**Goal:** A new flat page block embedding a topical chat with custom title +
prompt + focus datasets.

**Files:**
- `api/types/page-element-functional/schema.js` — **new** `$defs/element-custom-agent`:
  `type: { const: 'custom-agent' }`, `uuid` (`layout: 'none'`), `title`,
  `systemPrompt` (markdown/textarea), `focusDatasets` (array of `{id,title}` via
  the dataset-card `getItems` autocomplete), `height` (int px, default 500,
  min ~200), `mb`.
- `api/types/page-elements/schema.js` — append the `$ref`
  `…/page-element-functional#/$defs/element-custom-agent` at the **end** of
  `oneOf` (discriminator index 38, no renumbering) and add the matching
  `oneOfItems` `{ key: 38, title: 'Custom AI assistant', 'x-i18n-title': { fr:
  'Assistant IA personnalisé' } }` under the existing "Functional blocks" header.
- `portal/app/components/page-element/functional/page-element-custom-agent.vue`
  — **new**. Compose effective prompt (block prompt + shared portal context +
  focus-datasets line + containment line), build URL with `resolveAgentChatUrl`,
  render flat `<d-frame>` at `height` with `mb`, route the iframe `navigate`
  message to the router.
- `portal/app/components/page-element/page-element.vue` — add
  `<page-element-custom-agent v-else-if="element.type === 'custom-agent'" … />`
  in the Functional group.
- Run `npm run build-types` after schema edits.

**Approach:**
- Extract the shared portal-context suffix (domain / owner / title) currently
  inlined in `agent-chat.vue`'s `systemPrompt` into a small helper reused by both
  the global agent and the block, to avoid drift.
- Keep the composed prompt bounded (pass dataset ids + titles compactly) given
  it travels in the URL query; flag the d-frame-message fallback only if length
  becomes a problem.

**Verify:**
- Add the block in the page editor; it renders an inline chat. Ask it a data
  question scoped to a focus dataset → it uses the base data tools and a block
  describe tool, and can set a filter via `pageFilters_set` that updates a
  sibling embedded table/app on the same page.
- Confirm it does not navigate away unprompted (containment).

## Testing Strategy

- **Reuse existing harness:** `agent-chat-visibility.e2e.spec.ts` (display
  toggle) and `page-edit-webmcp.e2e.spec.ts` (tool registration via
  `navigator.modelContext`) are the templates.
- **New e2e:** (a) base tools present with chat disabled; (b) `pageFilters_set`
  drives a `shared-filters` embed; (c) describe tools appear per shared-filters
  block; (d) custom-agent block renders and its agent sees the shared toolset.
- Run only the related specs while iterating (`npm run test -- <file>`); the
  full suite runs on push via husky.
- `npm run check-types` + `npm run lint` before finishing.

## Risks & Mitigations

- **Wrong `reactiveSearchParams` Symbol** → inject returns undefined. Mitigation:
  import from `@data-fair/lib-vue/reactive-search-params.js`; assert non-null at
  registration and fail loud in dev.
- **Multiple chat instances on one BroadcastChannel** (global drawer + block(s)).
  Per-iframe messages are isolated; only auto-open broadcasts are shared.
  Validate a block doesn't trigger the drawer's auto-open and two blocks don't
  interfere. If they do, scope auto-open messages (defer to a follow-up; out of
  v1 scope unless it breaks).
- **SSR crash** from host mount. Mitigation: client-only guard around the host.
- **systemPrompt URL length** with many focus datasets. Mitigation: compact
  payload; d-frame-message fallback if needed.
- **Soft focus/containment** (prompt-only) is accepted per design.
