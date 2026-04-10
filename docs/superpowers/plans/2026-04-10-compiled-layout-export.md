# Compiled Layout Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the AI agent full access to page elements (all 38 types) in `edit-config.vue` by adding a `compiledLayout` export to types-builder and using it in the WebMCP composable.

**Architecture:** Extend types-builder with a new `compiledLayout` export type that runs `@json-layout/core`'s `compile()` + `serialize()` at build time, producing standalone JS modules. Add this export to `page-config-simple`'s schema. Rewrite the `use-page-config-webmcp` composable to import the pre-compiled layout instead of runtime-compiling a partial schema.

**Tech Stack:** `@json-layout/core` (compile/serialize), `@koumoul/vjsf-compiler`, types-builder CLI, Vue 3 composables

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `../lib/packages/types-builder/build.ts` | Modify | Add `compiledLayout` export type processing |
| `api/types/page-config-simple/schema.js` | Modify | Add `compiledLayout` to x-exports |
| `ui/src/composables/use-page-config-webmcp.ts` | Rewrite | Import pre-compiled layout, drop runtime compile |
| `tests/features/ui/page-edit-webmcp.e2e.spec.ts` | Modify | Add element-level WebMCP tool test |

---

### Task 1: Add `compiledLayout` export to types-builder

**Files:**
- Modify: `../lib/packages/types-builder/build.ts`

- [ ] **Step 1: Add `compiledLayout` to the SchemaExport type**

In `../lib/packages/types-builder/build.ts`, at line 16, add `'compiledLayout'` to the union:

```ts
type SchemaExport = ('types' | 'validate' | 'stringify' | 'schema' | 'resolvedSchema' | 'resolvedSchemaJson' | 'localDefsSchema' | 'localDefsSchemaJson' | 'vjsf' | 'compiledLayout')
```

- [ ] **Step 2: Add the `compiledLayout` branch**

Insert a new `else if` branch before the final `else { throw ... }` block (before line 353). This mirrors the `vjsf` branch but outputs only the serialized compiled layout as a standalone JS module:

```ts
      } else if (schemaExport === 'compiledLayout') {
        const vjsfLocales: string[] = schema['x-vjsf-locales'] ?? ['fr']
        const { compile: compileLayout } = await import('@json-layout/core')
        const { serialize: serializeCompiledLayout } = await import('@json-layout/core/src/compile/serialize')
        const { resolveXI18n } = await import('@json-layout/core')
        const { getFullOptions } = await import('@koumoul/vjsf-compiler/src/options.js')

        for (const locale of vjsfLocales) {
          const schemaVjsfOpts = { ...schema['x-vjsf'] }
          delete schemaVjsfOpts.compName
          const otherSchemas = { ...schemas }
          for (const [key, otherSchema] of Object.entries(schemas)) {
            if (key === schema.$id) continue
            otherSchemas[key] = clone(otherSchema)
            resolveXI18n(otherSchemas[key], locale)
          }
          if (schema.$id) delete otherSchemas[schema.$id]
          schemaVjsfOpts.ajvOptions = { schemas: otherSchemas }

          const fullOptions = getFullOptions({ locale, ...schemaVjsfOpts })
          for (const pluginImport of fullOptions.pluginsImports) {
            const componentInfo = (await import(pluginImport + '/info.js')).default
            fullOptions.components = fullOptions.components ?? {}
            fullOptions.components[componentInfo.name] = componentInfo
          }

          console.log(`  compiledLayout ${locale} options: ${JSON.stringify(schemaVjsfOpts)}`)
          const compiledLayout = compileLayout(schema, fullOptions)
          let compiledLayoutCode = await serializeCompiledLayout(compiledLayout)
          // The serialized code declares `const compiledLayout = {...}`.
          // Make it an export.
          compiledLayoutCode = compiledLayoutCode.replace('const compiledLayout =', 'export const compiledLayout =')

          const filePath = path.join(dir, '.type', `compiled-layout-${locale}.js`)
          writeFileSync(filePath, '/* eslint-disable */\n// @ts-nocheck\n\n' + compiledLayoutCode)
          console.log(`  compiledLayout ${locale} path: ${filePath}`)
        }
```

- [ ] **Step 3: Verify it compiles**

Run TypeScript type check on types-builder:

```bash
cd ../lib && npx tsc -p packages/types-builder/tsconfig.json --noEmit
```

If types-builder has no tsconfig, just verify syntax is valid by running the build-types command in the next task.

- [ ] **Step 4: Commit**

```bash
cd ../lib
git add packages/types-builder/build.ts
git commit -m "feat(types-builder): add compiledLayout export type"
```

---

### Task 2: Add `compiledLayout` export to page-config-simple and build

**Files:**
- Modify: `api/types/page-config-simple/schema.js`

- [ ] **Step 1: Update x-exports**

In `api/types/page-config-simple/schema.js` at line 15, change:

```js
  'x-exports': ['vjsf'],
```

to:

```js
  'x-exports': ['vjsf', 'compiledLayout'],
```

- [ ] **Step 2: Run build-types to generate the compiled layout files**

```bash
npm run build-types
```

Expected: The build should complete without errors. Two new files should appear:
- `api/types/page-config-simple/.type/compiled-layout-fr.js`
- `api/types/page-config-simple/.type/compiled-layout-en.js`

Verify they exist and contain an `export const compiledLayout`:

```bash
ls -la api/types/page-config-simple/.type/compiled-layout-*.js
head -5 api/types/page-config-simple/.type/compiled-layout-fr.js
```

- [ ] **Step 3: Commit**

```bash
git add api/types/page-config-simple/schema.js
git commit -m "feat: add compiledLayout export to page-config-simple schema"
```

Note: The generated `.type/compiled-layout-*.js` files should be gitignored (they're build artifacts like the other `.type/` contents). Verify `.gitignore` covers them — if `.type/` is already ignored, no action needed.

---

### Task 3: Rewrite the WebMCP composable to use pre-compiled layout

**Files:**
- Modify: `ui/src/composables/use-page-config-webmcp.ts`

- [ ] **Step 1: Rewrite the composable**

Replace the entire content of `ui/src/composables/use-page-config-webmcp.ts` with:

```ts
import { computed, shallowRef, watch, toRaw, type Ref } from 'vue'
import { StatefulLayout } from '@json-layout/core/state'
import { WebMCP } from '@json-layout/core/webmcp'
import equal from 'fast-deep-equal'
import type { PageConfig } from '#api/types/page/index.ts'

const compiledLayoutImports: Record<string, () => Promise<any>> = {
  fr: () => import('#api/types/page-config-simple/.type/compiled-layout-fr.js'),
  en: () => import('#api/types/page-config-simple/.type/compiled-layout-en.js')
}

export function usePageConfigWebMCP (
  editConfig: Ref<PageConfig | undefined>,
  locale: Ref<string>,
  onData: (data: any) => void
) {
  const compiledLayout = shallowRef<any>(null)
  const statefulLayout = shallowRef<StatefulLayout | null>(null)
  const webMCP = shallowRef<WebMCP | null>(null)
  let setupInProgress = false

  async function setup (cl: any, config: PageConfig) {
    if (setupInProgress) return
    setupInProgress = true
    try {
      if (webMCP.value) {
        await webMCP.value.unregisterTools()
        webMCP.value = null
      }

      const sl = new StatefulLayout(
        toRaw(cl),
        toRaw(cl.skeletonTrees[cl.mainTree]),
        {
          width: 600,
          updateOn: 'input',
          onData
        },
        toRaw(config)
      )
      statefulLayout.value = sl

      const wm = new WebMCP(
        sl as any,
        { prefixName: 'pageConfig_', dataTitle: 'Page configuration', includeSubAgent: true }
      )
      await wm.registerTools()
      webMCP.value = wm
    } catch (e) {
      console.error('[usePageConfigWebMCP] setup error', e)
    } finally {
      setupInProgress = false
    }
  }

  // Load compiled layout when locale changes
  watch(locale, async (loc) => {
    const importFn = compiledLayoutImports[loc] ?? compiledLayoutImports.fr
    const mod = await importFn()
    compiledLayout.value = mod.compiledLayout
  }, { immediate: true })

  // Re-create StatefulLayout + WebMCP when compiled layout changes
  watch(compiledLayout, async (cl) => {
    const config = editConfig.value
    if (!cl || !config) {
      if (webMCP.value) {
        await webMCP.value.unregisterTools()
        webMCP.value = null
      }
      statefulLayout.value = null
      return
    }
    await setup(cl, config)
  })

  // Initialize when editConfig first becomes available, and sync external changes
  watch(editConfig, async (config) => {
    if (config && compiledLayout.value && !webMCP.value) {
      await setup(compiledLayout.value, config)
    }
    // Sync external changes (user edits via main form) -> agent StatefulLayout
    if (statefulLayout.value && config && !equal(statefulLayout.value.data, toRaw(config))) {
      statefulLayout.value.data = toRaw(config)
    }
  })

  const configureContext = computed(() => {
    const lines = [
      'Use the subagent tool pageConfig_form to help the user configure this page.',
      'Start by asking the user what they want to achieve.',
    ]
    if (editConfig.value?.title) lines.push(`The page title is "${editConfig.value.title}".`)
    if (editConfig.value?.description) lines.push(`Description: ${editConfig.value.description}`)
    return lines.join(' ')
  })

  return { statefulLayout, webMCP, configureContext }
}
```

Key changes:
- Removed `compile` import from `@json-layout/core/compile` (no more runtime compilation)
- Removed `pageConfigSchema` import and `pageConfigMetaSchema` construction
- Added static import map for locale-specific compiled layouts
- `compiledLayout` is now a `shallowRef` loaded via dynamic import instead of a `computed` calling `compile()`
- Added a `watch(locale, ...)` to load the correct compiled layout on locale change
- Everything else (setup, data sync, configureContext) stays the same

- [ ] **Step 2: Run lint and type check**

```bash
npm run lint-fix
npm run check-types
```

Fix any issues that arise.

- [ ] **Step 3: Commit**

```bash
git add ui/src/composables/use-page-config-webmcp.ts
git commit -m "feat: use pre-compiled layout for WebMCP in edit-config

Replaces runtime compile of a trimmed metadata-only schema with
a pre-compiled layout from page-config-simple that includes all
38 element types, giving the AI agent full element access."
```

---

### Task 4: Update e2e test to verify element access

**Files:**
- Modify: `tests/features/ui/page-edit-webmcp.e2e.spec.ts`

- [ ] **Step 1: Add element-level WebMCP verification to the test**

After the existing reverse-sync test (after line 74), add a new test block that verifies the agent can interact with elements. Add this test inside the existing `test.describe` block:

```ts
  test('should give the agent access to page elements via WebMCP', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'WebMCP Elements Portal', menu: { children: [] } }
    })).data

    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Elements Test Page',
        elements: [{ uuid: 'test1', type: 'title', title: 'Original Title' }],
        genericMetadata: { slug: 'elements-test' }
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToWithAuth(
      `/portals-manager/pages/${createdPage._id}/edit-config`,
      'test_admin'
    )

    // Wait for VJSF form and WebMCP tools to be ready
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 10000 })
    await page.waitForFunction(() => {
      const mc = (navigator as any).modelContext
      return mc && typeof mc.listTools === 'function' && mc.listTools().some((t: any) => t.name === 'pageConfig_getData')
    }, { timeout: 10000 })

    // Verify getData returns elements
    const getData = await page.evaluate(async () => {
      const mc = (navigator as any).modelContext
      return await mc.callTool({ name: 'pageConfig_getData', arguments: {} })
    })
    const data = (getData as any)?.structuredContent?.data
    expect(data.elements).toBeDefined()
    expect(data.elements).toHaveLength(1)
    expect(data.elements[0].type).toBe('title')
  })
```

- [ ] **Step 2: Run the test**

```bash
npm run test -- tests/features/ui/page-edit-webmcp.e2e.spec.ts
```

Expected: Both tests pass — the original metadata test and the new element access test.

- [ ] **Step 3: Commit**

```bash
git add tests/features/ui/page-edit-webmcp.e2e.spec.ts
git commit -m "test: verify WebMCP agent has access to page elements"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run full lint + type check**

```bash
npm run lint
npm run check-types
```

- [ ] **Step 2: Run the WebMCP e2e tests**

```bash
npm run test -- tests/features/ui/page-edit-webmcp.e2e.spec.ts
```

Expected: All tests pass.

- [ ] **Step 3: Run the full e2e test suite to check for regressions**

```bash
npm run test-e2e
```

Expected: No regressions.
