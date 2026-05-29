# Custom AI Assistant page block — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Custom AI Assistant page block — a topical agent embedded inline in a page — plus page-context filter tools shared by both the block and the global portal agent, by making the WebMCP tool host always-on.

**Architecture:** Three independent pieces. (1) Lift the WebMCP frame server + base tool registration out of `agent-chat.vue` into an always-mounted host so tools exist regardless of the global-chat display toggle. (2) Add global `get`/`set` filter tools on the shared `reactiveSearchParams` object plus a per-block `describe` tool self-registered by each `shared-filters` block. (3) A new `custom-agent` page element rendering a flat `<d-frame>` chat.

**Tech Stack:** Nuxt 3 / Vue 3, `@data-fair/lib-vue-agents` (`useAgentTool`, `useFrameServer`), `@data-fair/lib-vue/reactive-search-params.js`, `@data-fair/frame` (`<d-frame>`), JSON-schema page-element definitions (`api/types/*`), Playwright e2e.

Design doc: `docs/superpowers/specs/2026-05-29-custom-ai-assistant-block-design.md`

---

## Critical gotchas (read before starting)

- **`useAgentTool` requires `navigator.modelContext` to exist and a live Vue effect scope.** It calls `navigator.modelContext.registerTool` and `onScopeDispose` for cleanup (`node_modules/@data-fair/lib-vue-agents/use-agent-tools.js`). It no-ops on the server (`typeof window === 'undefined'`). So registrations must run client-side, **after** `useFrameServer('portal')` installs the BrowserMcpServer, and **inside** a component setup or explicit `effectScope`.
- **`reactiveSearchParams` Symbol identity.** The app plugin (`portal/app/plugins/reactive-search-params.ts`) provides the object using the Symbol exported from **`@data-fair/lib-vue/reactive-search-params.js`**. Always import `useReactiveSearchParams` from **that same module**. Do not import a `useReactiveSearchParams` from anywhere else (a different copy = different Symbol = `inject` returns undefined).
- **`<d-frame>` is registered globally** by `portal/app/plugins/dframe.client.ts`. Use `d-frame-wrapper.vue` when you want router/query sync; use a raw `<d-frame>` (as `DfAgentChatDrawer.vue` does) when you only need a `src` + `@message`.
- **Tool registration order in the host matters:** `useFrameServer('portal')` first, then the tool composables (matches the current working order in `agent-chat.vue`).

---

## File structure

**New files**
- `portal/app/composables/agent/use-portal-agent-host.ts` — always-on host: frame server + the 5 base tool composables.
- `portal/app/composables/agent/page-params-tools.ts` — global `pageFilters_get` / `pageFilters_set` over `reactiveSearchParams`.
- `portal/app/composables/agent/page-filter-describe-tool.ts` — per-block `describe_filters_<uuid>` tool.
- `portal/app/components/agent/portal-agent-host.client.vue` — tiny client-only wrapper component that calls `usePortalAgentHost` (gives it a setup scope, mounts in `app.vue`).
- `portal/app/components/page-element/functional/page-element-custom-agent.vue` — the block renderer.

**Modified files**
- `portal/app/components/agent-chat.vue` — remove tool registration, keep display.
- `portal/app/app.vue` — mount the host wrapper.
- `portal/app/components/page-elements.vue` — register global filter tools at root.
- `portal/app/components/page-element/datasets/page-element-dataset-table.vue` — register describe tool when `shared-filters`.
- `portal/app/components/page-element/datasets/page-element-dataset-download.vue` — same.
- `portal/app/components/page-element/applications/page-element-application.vue` — same (advertises all `_d_*`).
- `portal/app/components/page-element/page-element.vue` — map `custom-agent` type.
- `api/types/page-element-functional/schema.js` — new `element-custom-agent` def.
- `api/types/page-elements/schema.js` — `oneOf` `$ref` + `oneOfItems` label.

**Test files**
- `tests/features/portal-rendering/agent-tools-always-on.e2e.spec.ts` — base tools present with chat disabled.
- `tests/features/portal-rendering/page-filter-tools.e2e.spec.ts` — get/set + describe tools.
- `tests/features/portal-rendering/custom-agent-block.e2e.spec.ts` — block renders, prompt composed.

---

## Task 1: Always-on agent host

**Files:**
- Create: `portal/app/composables/agent/use-portal-agent-host.ts`
- Create: `portal/app/components/agent/portal-agent-host.client.vue`
- Modify: `portal/app/components/agent-chat.vue`
- Modify: `portal/app/app.vue`
- Test: `tests/features/portal-rendering/agent-tools-always-on.e2e.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/features/portal-rendering/agent-tools-always-on.e2e.spec.ts`:

```typescript
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('agent tools are always on', () => {
  test.beforeEach(clean)

  test('base tools register even when the global chat is disabled', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'Tools Always On',
        menu: { children: [] },
        agentChat: { active: false }
      }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [{ uuid: 'h1', type: 'title', content: 'Hello', titleSize: 'h2' }] },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    await expect(page.getByText('Hello')).toBeVisible({ timeout: 15_000 })

    // The global chat toggle must NOT be shown...
    await expect(page.locator('.df-agent-chat-toggle')).toHaveCount(0)

    // ...but the WebMCP base tools must still be registered.
    await page.waitForFunction(() => {
      const mc = (navigator as any).modelContext
      return mc && typeof mc.listTools === 'function' &&
        mc.listTools().some((t: any) => t.name === 'list_datasets')
    }, { timeout: 15_000 })

    const toolNames = await page.evaluate(() =>
      (navigator as any).modelContext.listTools().map((t: any) => t.name))
    expect(toolNames).toContain('list_datasets')
    expect(toolNames).toContain('navigate')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/features/portal-rendering/agent-tools-always-on.e2e.spec.ts`
Expected: FAIL — `list_datasets` never registers because tools today only register when `agentChat.active && canSee`.

- [ ] **Step 3: Create the host composable**

Create `portal/app/composables/agent/use-portal-agent-host.ts` (logic lifted verbatim from `agent-chat.vue` lines 110-130):

```typescript
import type { Ref } from 'vue'
import type { $Fetch } from 'nitropack/types'
import type { PortalConfig } from '#api/types/portal-config'
import { useFrameServer } from '@data-fair/lib-vue-agents'
import { useAgentDatasetTools } from './dataset-tools'
import { useAgentDatasetDataTools } from './dataset-data-tools'
import { useAgentNavigationTools } from './navigation-tools'
import { useAgentGeoTools } from './geo-tools'
import { useAgentPortalContentTools } from './portal-content-tools'

export function usePortalAgentHost (opts: {
  locale: Ref<string>
  localFetch: $Fetch
  portalConfig: PortalConfig
  portalId: string
}) {
  // Must run client-side, inside a setup/effect scope. useFrameServer installs
  // the BrowserMcpServer on navigator.modelContext; tool composables register
  // onto it and clean themselves up via onScopeDispose.
  useFrameServer('portal')
  useAgentDatasetTools(opts.locale, opts.localFetch)
  useAgentDatasetDataTools(opts.locale, opts.localFetch)
  useAgentNavigationTools({
    locale: opts.locale,
    portalConfig: opts.portalConfig,
    navigationStore: useNavigationStore()
  })
  useAgentGeoTools(opts.locale)
  useAgentPortalContentTools(opts.locale, opts.localFetch, opts.portalId)
}
```

- [ ] **Step 4: Create the client-only wrapper component**

Create `portal/app/components/agent/portal-agent-host.client.vue` (the `.client.vue` suffix makes Nuxt render it client-only; its setup provides the effect scope):

```vue
<template>
  <!-- headless: registers WebMCP tools, renders nothing -->
</template>

<script setup lang="ts">
import type { $Fetch } from 'nitropack/types'
import type { PortalConfig } from '#api/types/portal-config'
import { toRef } from 'vue'
import { usePortalAgentHost } from '../../composables/agent/use-portal-agent-host'

const props = defineProps<{
  portalConfig: PortalConfig
  portalId: string
  locale: string
  localFetch: $Fetch
}>()

usePortalAgentHost({
  locale: toRef(() => props.locale),
  localFetch: props.localFetch,
  portalConfig: props.portalConfig,
  portalId: props.portalId
})
</script>
```

- [ ] **Step 5: Mount the host in app.vue**

In `portal/app/app.vue`, add the host next to the existing `AgentChat` (line 9). Replace:

```vue
    <ClientOnly><AgentChat :portal-config="$portal.config" :portal-id="$portal._id" :owner="$portal.owner" :locale="locale" :local-fetch="$localFetch" /></ClientOnly>
```

with:

```vue
    <ClientOnly>
      <PortalAgentHost :portal-config="$portal.config" :portal-id="$portal._id" :locale="locale" :local-fetch="$localFetch" />
      <AgentChat :portal-config="$portal.config" :portal-id="$portal._id" :owner="$portal.owner" :locale="locale" :local-fetch="$localFetch" />
    </ClientOnly>
```

(`PortalAgentHost` auto-imports from `components/agent/portal-agent-host.client.vue` per Nuxt component naming.)

- [ ] **Step 6: Remove tool registration from agent-chat.vue**

In `portal/app/components/agent-chat.vue`:
- Delete the imports on lines 60-65 (`useAgentDatasetTools`, `useAgentDatasetDataTools`, `useAgentNavigationTools`, `useAgentGeoTools`, `useAgentPortalContentTools`, `useFrameServer`).
- Delete the entire `toolsScope` block (lines ~110-131): the `let toolsScope`, the `watchEffect(...)`, and the `onScopeDispose(() => { toolsScope?.stop() })`.
- Remove now-unused imports from the `vue` import on line 57 (`effectScope`, `watchEffect`, `onScopeDispose`) — keep `defineAsyncComponent`, `computed`, `toRef`.

The remaining script keeps: props, `localeRef`, `agentChat`, `owner`, `session`, `viewerBucket`, `canSee`, `systemPrompt`. The template is unchanged (still gated on `agentChat?.active && canSee && owner`).

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm run test -- tests/features/portal-rendering/agent-tools-always-on.e2e.spec.ts`
Expected: PASS — base tools present, toggle absent.

- [ ] **Step 8: Verify the global chat still works**

Run: `npm run test -- tests/features/portal-rendering/agent-chat-visibility.e2e.spec.ts`
Expected: PASS (no regression in display gating).

- [ ] **Step 9: Type-check and commit**

Run: `npm run check-types`
Expected: no new errors.

```bash
git add portal/app/composables/agent/use-portal-agent-host.ts \
        portal/app/components/agent/portal-agent-host.client.vue \
        portal/app/components/agent-chat.vue portal/app/app.vue \
        tests/features/portal-rendering/agent-tools-always-on.e2e.spec.ts
git commit -m "feat(portal): always register agent tools independent of chat toggle"
```

---

## Task 2: Global page-filter get/set tools

**Files:**
- Create: `portal/app/composables/agent/page-params-tools.ts`
- Modify: `portal/app/components/page-elements.vue`
- Test: `tests/features/portal-rendering/page-filter-tools.e2e.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/features/portal-rendering/page-filter-tools.e2e.spec.ts`:

```typescript
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('page filter tools', () => {
  test.beforeEach(clean)

  test('pageFilters_set writes a _c_ key and pageFilters_get reads it back', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Filter Tools', menu: { children: [] }, agentChat: { active: false } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [{ uuid: 'h1', type: 'title', content: 'Hello', titleSize: 'h2' }] },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    await expect(page.getByText('Hello')).toBeVisible({ timeout: 15_000 })

    await page.waitForFunction(() => {
      const mc = (navigator as any).modelContext
      return mc?.listTools?.().some((t: any) => t.name === 'pageFilters_set')
    }, { timeout: 15_000 })

    await page.evaluate(async () => {
      await (navigator as any).modelContext.callTool({
        name: 'pageFilters_set',
        arguments: { params: { _c_theme_eq: 'health' } }
      })
    })

    // it should have written to the URL query
    await expect.poll(() => new URL(page.url()).searchParams.get('_c_theme_eq')).toBe('health')

    const got = await page.evaluate(async () => {
      const r = await (navigator as any).modelContext.callTool({ name: 'pageFilters_get', arguments: {} })
      return r?.structuredContent ?? r
    })
    expect(JSON.stringify(got)).toContain('_c_theme_eq')
    expect(JSON.stringify(got)).toContain('health')

    // empty value clears the key
    await page.evaluate(async () => {
      await (navigator as any).modelContext.callTool({
        name: 'pageFilters_set',
        arguments: { params: { _c_theme_eq: '' } }
      })
    })
    await expect.poll(() => new URL(page.url()).searchParams.get('_c_theme_eq')).toBe(null)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/features/portal-rendering/page-filter-tools.e2e.spec.ts`
Expected: FAIL — `pageFilters_set` not registered.

- [ ] **Step 3: Create the global filter tools composable**

Create `portal/app/composables/agent/page-params-tools.ts`:

```typescript
import type { Ref } from 'vue'
import { useAgentTool } from '@data-fair/lib-vue-agents'
import { useReactiveSearchParams } from '@data-fair/lib-vue/reactive-search-params.js'
import { createAgentTranslator } from './utils'

const messages = {
  fr: { get: 'Lire les filtres de la page', set: 'Modifier les filtres de la page' },
  en: { get: 'Read page filters', set: 'Set page filters' }
}

// keys synced with embedded apps/previews: concept filters (_c…) and per-dataset
// filters (_d_…). We only expose these to the agent, not unrelated router params.
const isFilterKey = (k: string) => k.startsWith('_c') || k.startsWith('_d')

export function usePageParamsTools (locale: Ref<string>) {
  const t = createAgentTranslator(messages, locale)
  const searchParams = useReactiveSearchParams()

  useAgentTool({
    name: 'pageFilters_get',
    description: 'Read the current page filters synced with embedded visualizations and dataset previews. Returns concept filters (keys starting with "_c") and per-dataset filters (keys starting with "_d_<datasetId>_"). Call a block\'s describe_filters_* tool first to learn which keys it accepts.',
    annotations: { title: t('get'), readOnlyHint: true },
    inputSchema: { type: 'object' as const, properties: {} },
    execute: async () => {
      const current: Record<string, string> = {}
      for (const k of Object.keys(searchParams)) {
        if (isFilterKey(k)) current[k] = searchParams[k]
      }
      const text = Object.keys(current).length
        ? Object.entries(current).map(([k, v]) => `- \`${k}\` = ${v}`).join('\n')
        : 'No page filters are currently set.'
      return { content: [{ type: 'text' as const, text }], structuredContent: current }
    }
  })

  useAgentTool({
    name: 'pageFilters_set',
    description: 'Set or clear page filters synced with embedded visualizations and dataset previews. Pass a "params" object mapping filter keys to values; an empty string, null, or undefined value clears that key. Use keys advertised by a block\'s describe_filters_* tool (concept keys start with "_c", per-dataset keys with "_d_<datasetId>_").',
    annotations: { title: t('set') },
    inputSchema: {
      type: 'object' as const,
      properties: {
        params: {
          type: 'object' as const,
          description: 'Map of filter key -> value. Empty/null value clears the key.',
          additionalProperties: { type: 'string' as const }
        }
      },
      required: ['params'] as const
    },
    execute: async (args) => {
      const params = (args.params ?? {}) as Record<string, unknown>
      const applied: string[] = []
      for (const [k, v] of Object.entries(params)) {
        if (v === '' || v === null || v === undefined) {
          delete searchParams[k]
          applied.push(`cleared ${k}`)
        } else {
          searchParams[k] = String(v)
          applied.push(`${k} = ${String(v)}`)
        }
      }
      const text = applied.length ? `Applied: ${applied.join(', ')}` : 'No changes.'
      return { content: [{ type: 'text' as const, text }] }
    }
  })
}
```

- [ ] **Step 4: Register the tools at the page root**

In `portal/app/components/page-elements.vue`, register only when `root`. Update the `<script setup>`:

```vue
<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'
import { usePageParamsTools } from '../composables/agent/page-params-tools'

const props = withDefaults(defineProps<{ root?: boolean }>(), {
  root: true
})

const elements = defineModel<PageElement[]>()

const { locale } = useI18n()
if (props.root) usePageParamsTools(toRef(() => locale.value))
</script>
```

(Keep the existing `<template>` unchanged. `useI18n`/`toRef` are auto-imported in this Nuxt app.)

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- tests/features/portal-rendering/page-filter-tools.e2e.spec.ts`
Expected: PASS — set writes the query, get reads it, empty clears it.

- [ ] **Step 6: Type-check and commit**

Run: `npm run check-types`
Expected: no new errors.

```bash
git add portal/app/composables/agent/page-params-tools.ts \
        portal/app/components/page-elements.vue \
        tests/features/portal-rendering/page-filter-tools.e2e.spec.ts
git commit -m "feat(portal): add page filter get/set agent tools on shared search params"
```

---

## Task 3: Per-block describe tool

**Files:**
- Create: `portal/app/composables/agent/page-filter-describe-tool.ts`
- Modify: `portal/app/components/page-element/datasets/page-element-dataset-table.vue`
- Modify: `portal/app/components/page-element/applications/page-element-application.vue`
- Test: add a case to `tests/features/portal-rendering/page-filter-tools.e2e.spec.ts`

> **Note:** only two block types support `shared-filters` via a schema enum and a
> reactive `syncParams` computed: `dataset-table` and `application`. The
> `dataset-download` element has **no** `syncParams` property (schema has only
> `type`/`uuid`/`dataset`/`mb`; the component passes a static `sync-params`
> attr), so it does **not** get a describe tool. Earlier design text mentioning
> download here is superseded.

- [ ] **Step 1: Write the failing test**

Append to `tests/features/portal-rendering/page-filter-tools.e2e.spec.ts` (inside the same `describe`):

```typescript
  test('a shared-filters dataset-table registers a describe tool, sandboxed does not', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Describe Tools', menu: { children: [] }, agentChat: { active: false } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: {
        title: 'Home',
        elements: [
          { uuid: 'shared1', type: 'dataset-table', dataset: { id: 'ds-shared', title: 'Shared DS' }, syncParams: 'shared-filters', interactions: 'all' },
          { uuid: 'sand1', type: 'dataset-table', dataset: { id: 'ds-sandboxed', title: 'Sandboxed DS' }, syncParams: 'sandboxed', interactions: 'all' }
        ]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    await page.waitForFunction(() => {
      const mc = (navigator as any).modelContext
      return mc?.listTools?.().some((t: any) => t.name === 'pageFilters_get')
    }, { timeout: 15_000 })

    const toolNames = await page.evaluate(() =>
      (navigator as any).modelContext.listTools().map((t: any) => t.name))
    expect(toolNames).toContain('describe_filters_shared1')
    expect(toolNames).not.toContain('describe_filters_sand1')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/features/portal-rendering/page-filter-tools.e2e.spec.ts`
Expected: FAIL — `describe_filters_shared1` not registered.

- [ ] **Step 3: Create the describe-tool composable**

Create `portal/app/composables/agent/page-filter-describe-tool.ts`:

```typescript
import { useAgentTool } from '@data-fair/lib-vue-agents'

/**
 * Each shared-filters page block self-registers one of these so the agent can
 * discover what the block is and which filter keys it honors. Call only when
 * element.syncParams === 'shared-filters'.
 */
export function usePageFilterDescribeTool (opts: {
  uuid: string
  title: string        // human label shown in the agent UI
  description: string  // static text: what the block is + accepted key prefixes
}) {
  useAgentTool({
    name: `describe_filters_${opts.uuid}`,
    description: opts.description,
    annotations: { title: opts.title, readOnlyHint: true },
    inputSchema: { type: 'object' as const, properties: {} },
    execute: async () => ({ content: [{ type: 'text' as const, text: opts.description }] })
  })
}
```

- [ ] **Step 4: Register it from the dataset-table block**

In `portal/app/components/page-element/datasets/page-element-dataset-table.vue`, add to `<script setup>` after the `syncParams` computed:

```typescript
import { usePageFilterDescribeTool } from '../../../composables/agent/page-filter-describe-tool'

if (element.syncParams === 'shared-filters' && element.dataset?.id && element.uuid) {
  usePageFilterDescribeTool({
    uuid: element.uuid,
    title: `Filtres : ${element.dataset.title}`,
    description: `This page has a data table for dataset "${element.dataset.title}" (id: ${element.dataset.id}). It honors page concept filters (keys starting with "_c") and its own dataset filters (keys starting with "_d_${element.dataset.id}_"). Use pageFilters_set with such keys to filter this table.`
  })
}
```

- [ ] **Step 5: Register it from the application block**

In `portal/app/components/page-element/applications/page-element-application.vue`, add after the `syncParams` computed (this block reflects **all** page filters, not one dataset):

```typescript
import { usePageFilterDescribeTool } from '../../../composables/agent/page-filter-describe-tool'

if (element.syncParams === 'shared-filters' && element.uuid) {
  usePageFilterDescribeTool({
    uuid: element.uuid,
    title: `Filtres : ${element.application?.title ?? 'visualisation'}`,
    description: `This page has a visualization "${element.application?.title ?? ''}" that reflects all page filters: concept filters (keys starting with "_c") and every dataset filter (keys starting with "_d_"). Use pageFilters_set to drive it.`
  })
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm run test -- tests/features/portal-rendering/page-filter-tools.e2e.spec.ts`
Expected: PASS — `describe_filters_shared1` present, `describe_filters_sand1` absent.

- [ ] **Step 7: Type-check and commit**

Run: `npm run check-types`
Expected: no new errors.

```bash
git add portal/app/composables/agent/page-filter-describe-tool.ts \
        portal/app/components/page-element/datasets/page-element-dataset-table.vue \
        portal/app/components/page-element/applications/page-element-application.vue \
        tests/features/portal-rendering/page-filter-tools.e2e.spec.ts
git commit -m "feat(portal): per-block describe tool for shared-filters page elements"
```

---

## Task 4: Custom-agent block schema

**Files:**
- Modify: `api/types/page-element-functional/schema.js`
- Modify: `api/types/page-elements/schema.js`

- [ ] **Step 1: Add the element definition**

In `api/types/page-element-functional/schema.js`, add a new entry to `$defs` (alongside `element-search`, `element-topics`, `element-contact`):

```javascript
    'element-custom-agent': {
      type: 'object',
      title: 'CustomAgentElement',
      'x-i18n-title': {
        en: 'Custom AI assistant',
        fr: 'Assistant IA personnalisé'
      },
      required: ['type'],
      properties: {
        type: { const: 'custom-agent' },
        uuid: { type: 'string', layout: 'none' },
        title: {
          title: "Titre de l'assistant",
          'x-i18n-title': { en: 'Assistant title' },
          type: 'string'
        },
        systemPrompt: {
          title: 'Instructions (prompt)',
          'x-i18n-title': { en: 'Instructions (prompt)' },
          description: "Décrivez le rôle de cet assistant et le sujet sur lequel il aide.",
          type: 'string',
          layout: 'textarea'
        },
        focusDatasets: {
          title: 'Jeux de données prioritaires',
          'x-i18n-title': { en: 'Focus datasets' },
          description: "L'assistant concentre ses explorations sur ces jeux de données (sans s'y limiter strictement).",
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id'],
            properties: {
              id: { type: 'string' },
              title: { type: 'string' }
            }
          },
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title&size=20&sort=updatedAt:-1',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            }
          }
        },
        height: {
          title: 'Hauteur (px)',
          'x-i18n-title': { en: 'Height (px)' },
          type: 'integer',
          minimum: 200,
          default: 500
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
```

- [ ] **Step 2: Register it in the elements union**

In `api/types/page-elements/schema.js`:

1. Append to the **end** of the `oneOf` array (after the last News `$ref`, line ~226 — keep the existing entries unchanged):

```javascript
        ,
        // Functional (added late to keep discriminator index stable)
        { $ref: 'https://github.com/data-fair/portals/page-element-functional#/$defs/element-custom-agent' }
```

2. Add the label under the existing "Functional blocks" header in `oneOfItems` (after the `key: 19` contact entry, line ~104):

```javascript
          { key: 38, title: 'Custom AI assistant', 'x-i18n-title': { fr: 'Assistant IA personnalisé' } },
```

(Key 38 = the new `oneOf` index since existing entries are 0-37. Placing the label under the Functional header while the `$ref` sits at the array end is fine — `oneOfItems` `key` is what binds label→schema, not array adjacency.)

- [ ] **Step 3: Build types**

Run: `npm run build-types`
Expected: regenerates `api/types/page-elements/.type/*` and `#api/types/page-elements` with a `CustomAgent` member; no errors.

- [ ] **Step 4: Verify the type exists**

Run: `grep -rl "custom-agent" api/types/page-elements/.type/`
Expected: matches in the generated type/validate files.

- [ ] **Step 5: Commit**

```bash
git add api/types/page-element-functional/schema.js api/types/page-elements/schema.js api/types/**/.type/
git commit -m "feat(api): add custom-agent page element schema"
```

---

## Task 5: Custom-agent block renderer

**Files:**
- Create: `portal/app/components/page-element/functional/page-element-custom-agent.vue`
- Modify: `portal/app/components/page-element/page-element.vue`
- Modify: `portal/app/components/agent-chat.vue` (extract shared portal-context prompt helper)
- Create: `portal/app/composables/agent/portal-prompt-context.ts`
- Test: `tests/features/portal-rendering/custom-agent-block.e2e.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/features/portal-rendering/custom-agent-block.e2e.spec.ts`:

```typescript
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('custom agent block', () => {
  test.beforeEach(clean)

  test('renders an inline agent iframe with composed title and prompt', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Block Portal', menu: { children: [] }, agentChat: { active: false } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: {
        title: 'Home',
        elements: [{
          uuid: 'ca1',
          type: 'custom-agent',
          title: 'Health helper',
          systemPrompt: 'You help explore health data.',
          focusDatasets: [{ id: 'ds-health', title: 'Health DS' }],
          height: 480
        }]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)

    const frame = page.locator('iframe[src*="/agents/"][src*="/chat"]')
    await expect(frame).toBeVisible({ timeout: 15_000 })

    const src = await frame.getAttribute('src')
    expect(src).toContain('title=Health+helper')
    // composed prompt carries focus dataset + containment hint (URL-encoded)
    const decoded = decodeURIComponent(new URL(src!, 'http://x').searchParams.get('systemPrompt') || '')
    expect(decoded).toContain('You help explore health data.')
    expect(decoded).toContain('ds-health')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/features/portal-rendering/custom-agent-block.e2e.spec.ts`
Expected: FAIL — unknown element renders the fallback "Unknown element".

- [ ] **Step 3: Extract the shared portal-context prompt helper**

Create `portal/app/composables/agent/portal-prompt-context.ts` (lifts the suffix currently inlined in `agent-chat.vue` so both agents share it):

```typescript
import type { PortalConfig } from '#api/types/portal-config'

/** Portal context appended to every agent's system prompt (domain/owner/title). */
export function portalPromptContext (portalConfig: PortalConfig, ownerName?: string): string[] {
  const parts: string[] = []
  const domain = import.meta.client ? window.location.hostname : ''
  if (domain) parts.push(`Le nom de domaine de ce portail est "${domain}".`)
  if (ownerName) parts.push(`Ce portail est géré par "${ownerName}".`)
  if (portalConfig.title) parts.push(`Le titre de ce portail est "${portalConfig.title}".`)
  return parts
}

/** Hint shared with the global agent about offering filtered navigation views. */
export const navigateToFilteredViewHint = 'Quand tu effectues une recherche ou un filtrage de données dans un jeu de données, propose systématiquement à l\'utilisateur de naviguer vers une vue filtrée. Le sous-agent dataset_data inclut dans sa section Context un champ filterQuery (query string URL) et un champ columns (colonnes pertinentes). Utilise l\'outil navigate avec la filterQuery comme paramètre query en y ajoutant select=col1,col2,col3 à partir des clés de columns. Propose la vue tableau /datasets/{datasetId}/table, et si les données sont géolocalisées (présence de bbox, geo_distance dans la filterQuery, ou colonnes géographiques dans columns) propose également la vue carte /datasets/{datasetId}/map.'
```

- [ ] **Step 4: Use the helper in agent-chat.vue**

In `portal/app/components/agent-chat.vue`, replace the body of the `systemPrompt` computed (lines 99-108) to reuse the helper (keeps identical output):

```typescript
import { portalPromptContext, navigateToFilteredViewHint } from '../composables/agent/portal-prompt-context'

const systemPrompt = computed(() => {
  const base = agentChat.value?.systemPrompt || ''
  const parts = [base, ...portalPromptContext(props.portalConfig, props.owner.name)]
  parts.push(navigateToFilteredViewHint)
  return parts.join('\n')
})
```

- [ ] **Step 5: Create the block component**

Create `portal/app/components/page-element/functional/page-element-custom-agent.vue`:

```vue
<template>
  <ClientOnly>
    <d-frame
      v-if="src"
      :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
      :src="src"
      :iframe-title="element.title || t('assistant')"
      resize="no"
      :style="{ height: `${element.height ?? 500}px`, width: '100%' }"
      @message="onMessage"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { CustomAgent } from '#api/types/page-elements/index.ts'
import('@data-fair/frame/lib/d-frame.js')
import { resolveAgentChatUrl } from '@data-fair/lib-vuetify-agents/useAgentChatBase.js'
import { portalPromptContext } from '../../../composables/agent/portal-prompt-context'

const { element } = defineProps<{ element: CustomAgent }>()
const { t } = useI18n()
// usePortalStore exposes { portal: Ref, portalConfig: ComputedRef, preview, siteInfo }
const { portal, portalConfig } = usePortalStore()
const owner = computed(() => portal.value.owner)
const router = useRouter()

const systemPrompt = computed(() => {
  const parts = [element.systemPrompt || '', ...portalPromptContext(portalConfig.value, owner.value?.name)]
  if (element.focusDatasets?.length) {
    const list = element.focusDatasets.map(d => `"${d.title ?? d.id}" (id: ${d.id})`).join(', ')
    parts.push(`Concentre tes explorations de données sur ces jeux de données : ${list}. Tu peux explorer le reste du catalogue uniquement si l'utilisateur le demande explicitement.`)
  }
  parts.push("Ton travail est limité au contexte de cette page. N'utilise pas l'outil de navigation pour quitter la page, sauf si l'utilisateur le demande explicitement.")
  return parts.join('\n')
})

const src = computed(() => owner.value && resolveAgentChatUrl({
  accountType: owner.value.type,
  accountId: owner.value.id,
  chatTitle: element.title,
  systemPrompt: systemPrompt.value
}))

// Route in-iframe navigation requests to the portal router (same pattern as
// lib-vuetify-agents useAgentChatBase onDFrameMessage).
const onMessage = (event: CustomEvent<{ type: string, url?: string }>) => {
  const msg = event.detail
  if (msg?.type === 'navigate' && msg.url) {
    const parsed = new URL(msg.url, window.location.origin)
    if (parsed.origin === window.location.origin) router.push(parsed.pathname + parsed.search + parsed.hash)
    else window.location.href = msg.url
  }
}
</script>

<i18n lang="yaml">
  en:
    assistant: AI assistant
  fr:
    assistant: Assistant IA
</i18n>
```

- [ ] **Step 6: Map the type in page-element.vue**

In `portal/app/components/page-element/page-element.vue`, add inside the "Functional blocks" group (after `page-element-contact`, line ~61):

```vue
  <page-element-custom-agent
    v-else-if="element.type === 'custom-agent'"
    :element="element"
  />
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm run test -- tests/features/portal-rendering/custom-agent-block.e2e.spec.ts`
Expected: PASS — iframe visible, title + composed prompt in `src`.

- [ ] **Step 8: Verify no regression in the global agent prompt**

Run: `npm run test -- tests/features/portal-rendering/agent-chat-visibility.e2e.spec.ts tests/features/portal-rendering/agent-tools-always-on.e2e.spec.ts`
Expected: PASS.

- [ ] **Step 9: Type-check, lint, commit**

Run: `npm run check-types && npm run lint`
Expected: no new errors.

```bash
git add portal/app/components/page-element/functional/page-element-custom-agent.vue \
        portal/app/components/page-element/page-element.vue \
        portal/app/components/agent-chat.vue \
        portal/app/composables/agent/portal-prompt-context.ts \
        tests/features/portal-rendering/custom-agent-block.e2e.spec.ts
git commit -m "feat(portal): custom AI assistant page block"
```

---

## Task 6: Final integration verification

- [ ] **Step 1: Run all new + adjacent specs together**

Run:
```bash
npm run test -- tests/features/portal-rendering/agent-tools-always-on.e2e.spec.ts \
                tests/features/portal-rendering/page-filter-tools.e2e.spec.ts \
                tests/features/portal-rendering/custom-agent-block.e2e.spec.ts \
                tests/features/portal-rendering/agent-chat-visibility.e2e.spec.ts \
                tests/features/ui/page-edit-webmcp.e2e.spec.ts
```
Expected: all PASS.

- [ ] **Step 2: Full type-check and lint**

Run: `npm run check-types && npm run lint`
Expected: clean.

- [ ] **Step 3: Manual smoke (optional but recommended)**

Add a `custom-agent` block to a page in the editor, open the portal, ask the agent to filter a sibling `shared-filters` table; confirm the table updates and the agent stays on the page. Note any deviations for follow-up.

- [ ] **Step 4: Final commit if any fixups were needed**

```bash
git add -A && git commit -m "test(portal): integration pass for custom AI assistant block"
```

---

## Self-review notes (resolved)

- **Spec coverage:** always-on host (Task 1) ✓; reactiveSearchParams get/set (Task 2) ✓; per-block describe replacing central scanner (Task 3) ✓; block schema in functional file + oneOf key 38 (Task 4) ✓; flat d-frame block with composed prompt/focus/containment + shared prompt helper (Task 5) ✓; navigation included-but-instructed-against via prompt (Task 5 containment line) ✓; integration (Task 6) ✓.
- **Naming consistency:** `usePortalAgentHost`, `usePageParamsTools`, `usePageFilterDescribeTool`, `portalPromptContext`, tools `pageFilters_get`/`pageFilters_set`/`describe_filters_<uuid>` used identically across tasks.
- **Open assumptions to verify during execution (do not block):**
  - `usePortalStore()` (verified in `portal/app/composables/use-portal-store.ts`) returns `{ portal: Ref<RequestPortal>, portalConfig: ComputedRef<config>, preview, siteInfo }` — there is **no** `config`/`owner` key. Task 5 uses `portalConfig.value` and `portal.value.owner`.
  - `resolveAgentChatUrl` is **not** re-exported from the `@data-fair/lib-vuetify-agents` index (only the Df* components + drawer/menu composables are). Task 5 imports it from `@data-fair/lib-vuetify-agents/useAgentChatBase.js` (verified present).
  - `page-element-dataset-download.vue` is intentionally **excluded** from Task 3: its schema has no `syncParams` enum (only `type`/`uuid`/`dataset`/`mb`) and the component passes a static `sync-params` attr, so there is no `shared-filters` mode to advertise. Only `dataset-table` and `application` get describe tools.
```
