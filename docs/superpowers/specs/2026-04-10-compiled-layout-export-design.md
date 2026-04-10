# Compiled Layout Export for Full WebMCP Page Element Access

## Problem

In `edit-config.vue`, the WebMCP integration (composable `use-page-config-webmcp.ts`) uses a runtime-compiled, metadata-only schema. The `elements` property is stripped because its external `$ref`s (38 element types across 8 categories) cannot be resolved by `compile()` at runtime. This means the AI agent cannot interact with page elements in the full editor — only metadata fields (title, description, etc.).

Meanwhile, `edit-simple.vue` uses a pre-compiled VJSF component (`vjsf-page-config-simple`) that includes all elements with `webmcp: true` built in. Its compiled layout has all refs resolved at build time.

## Goal

Give the AI agent full access to page elements (all 38 types) in `edit-config.vue` by reusing the compiled layout from `page-config-simple`, avoiding runtime schema compilation.

## Design

### 1. types-builder: Add `compiledLayout` export type

**File:** `../lib/packages/types-builder/build.ts`

Add `'compiledLayout'` to the `SchemaExport` type union. Add a new branch in the export processing loop:

1. Import `compile` from `@json-layout/core` and `serialize` from `@json-layout/core/src/compile/serialize`
2. For each locale in `x-vjsf-locales` (default `['fr']`):
   - Prepare schema same as the `vjsf` branch: resolve x-i18n on other schemas, set up `otherSchemas` for AJV
   - Call `compile(schema, { locale, ...vjsfOpts })` — synchronous, returns live `CompiledLayout`
   - Call `serialize(compiledLayout)` — async, produces ESM code string containing `const compiledLayout = {...}` with inline AJV validators, serialized skeleton trees, expression functions
   - Append `export { compiledLayout }` to the output
   - Write to `.type/compiled-layout-{locale}.js`
3. No index.js re-exports needed — the compiled layout files are imported directly by path

The implementation closely mirrors the existing `vjsf` branch but skips Vue component generation (no EJS template, no component imports).

### 2. page-config-simple schema: Add export

**File:** `api/types/page-config-simple/schema.js`

Change `x-exports` from `['vjsf']` to `['vjsf', 'compiledLayout']`.

This schema already has:
- All element types resolved locally via `#/$defs/element`
- `webmcp: true` in `x-vjsf`
- Elements with `listEditMode: 'dialog'` (exposing full element structure, not hidden behind a custom slot)

### 3. Composable: Import pre-compiled layout

**File:** `ui/src/composables/use-page-config-webmcp.ts`

Replace the current approach (inline trimmed schema + runtime `compile()`) with:

1. Remove the `pageConfigMetaSchema` construction and the `compile()` import
2. Use dynamic `import()` to load the pre-compiled layout for the current locale:
   ```ts
   const mod = await import(`#api/types/page-config-simple/.type/compiled-layout-${locale}.js`)
   ```
3. Watch `locale` to re-import when it changes
4. Create `StatefulLayout` + `WebMCP` from the imported compiled layout
5. Keep the existing data sync logic unchanged (editConfig <-> statefulLayout bidirectional sync)

The composable no longer needs `@json-layout/core/compile` as a runtime dependency.

## Files Changed

| File | Change |
|------|--------|
| `../lib/packages/types-builder/build.ts` | Add `compiledLayout` export type |
| `api/types/page-config-simple/schema.js` | Add `compiledLayout` to x-exports |
| `ui/src/composables/use-page-config-webmcp.ts` | Replace runtime compile with pre-compiled layout import |

## Testing

The existing e2e test `tests/features/ui/page-edit-webmcp.e2e.spec.ts` validates that:
- WebMCP tools are registered on `navigator.modelContext`
- `pageConfig_setFieldValue` can change field values
- Form edits sync back to StatefulLayout data

After this change, the test should additionally verify that element-related tools work (e.g., setting a value inside an element). The test may need updating to exercise element access.
