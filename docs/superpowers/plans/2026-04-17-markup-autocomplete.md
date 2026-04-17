# Markup Editor Autocomplete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three-level CodeMirror autocomplete (tag names, attribute names, attribute values) to the page-edit markup editor, with localized titles pulled from the JSON Schema.

**Architecture:** Extend the existing build-time schema analyzer (`build/markup/schema-analyzer.ts`) to emit localized titles on tag, attribute, and enum-value descriptors. Add a runtime completion source (`shared/markup/codemirror/completion.ts`) that inspects the Lezer syntax tree at the cursor and emits tag, attribute, or value suggestions depending on context. Thread the Vue UI locale into the CodeMirror extension at mount time.

**Tech Stack:** TypeScript, CodeMirror 6 (`@codemirror/autocomplete`, `@codemirror/state`, `@codemirror/language`), Lezer grammar, Playwright for unit tests, Vue 3 + vue-i18n.

**Spec:** `docs/superpowers/specs/2026-04-17-markup-autocomplete-design.md`

---

## File Structure

**Modified:**
- `shared/markup/types.ts` — add `titles` / `enumTitles` fields to `TagDescriptor`, `ChildrenSlot`, `AttributeDescriptor`
- `shared/markup/package.json` — add `@codemirror/autocomplete` dependency
- `build/markup/schema-analyzer.ts` — extract `title` / `x-i18n-title` / enum-value titles
- `shared/markup/codemirror/index.ts` — signature change, bundle `autocompletion()` + completion source
- `ui/src/components/page-edit/page-edit-elements-markup.vue` — pass locale, include `completionKeymap`

**Created:**
- `shared/markup/codemirror/completion.ts` — the completion source
- `tests/features/markup/analyzer-titles.unit.spec.ts` — assertions on extracted titles
- `tests/features/markup/completion.unit.spec.ts` — per-branch completion tests

**Regenerated (do not hand-edit):**
- `shared/markup/tag-descriptors.ts` — regenerated via `npm run build-types`

---

## Task 1: Add `@codemirror/autocomplete` dependency

**Files:**
- Modify: `shared/markup/package.json`

- [ ] **Step 1: Add the dependency**

Edit `shared/markup/package.json` — add `"@codemirror/autocomplete"` and `"@lezer/common"` (the completion source imports `SyntaxNode` from it) in alphabetical position:

```json
{
  "name": "@data-fair/portals-shared-markup",
  "type": "module",
  "main": "index.ts",
  "exports": {
    ".": "./index.ts",
    "./codemirror": "./codemirror/index.ts"
  },
  "dependencies": {
    "@codemirror/autocomplete": "^6.18.0",
    "@codemirror/commands": "^6.6.0",
    "@codemirror/language": "^6.10.2",
    "@codemirror/lint": "^6.8.0",
    "@codemirror/state": "^6.4.1",
    "@codemirror/view": "^6.28.0",
    "@lezer/common": "^1.2.0",
    "@lezer/highlight": "^1.2.0",
    "@lezer/lr": "^1.4.0"
  },
  "devDependencies": {
    "@lezer/generator": "^1.7.0"
  }
}
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: package-lock.json updated, `node_modules/@codemirror/autocomplete/` present.

Verify:
```bash
ls node_modules/@codemirror/autocomplete/dist/index.js
```
Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add shared/markup/package.json package-lock.json
git commit -m "chore: add @codemirror/autocomplete dep for markup editor"
```

---

## Task 2: Extend descriptor types with titles fields

**Files:**
- Modify: `shared/markup/types.ts`

- [ ] **Step 1: Add fields**

Replace the contents of `shared/markup/types.ts` with:

```typescript
export interface TagDescriptor {
  tagName: string
  contentProperty: string | null
  childrenSlots: ChildrenSlot[]
  attributes: AttributeDescriptor[]
  hiddenProperties: string[]
  /** Locale → title, e.g. { en: "Banner", fr: "Bannière" }. Omitted when no title is declared in the schema. */
  titles?: Record<string, string>
}

export interface ChildrenSlot {
  /** JSON property name: "children", "children2", "tabs", "panels", "advancedFilters", "actions", "links" */
  property: string
  /** Virtual tag name in markup, or null for direct nesting */
  virtualTag: string | null
  /** For structured containers (tabs, panels) and link containers (actions, links): attributes on each virtual tag item */
  itemAttributes?: AttributeDescriptor[]
  /** Whether items in this slot are page elements (true) or structured objects with a children sub-property (false for tabs/panels) or link items */
  kind: 'direct' | 'structured' | 'link'
  /** Locale → title, taken from the array property's schema when available. Omitted otherwise. */
  titles?: Record<string, string>
}

export interface AttributeDescriptor {
  /** Attribute name in markup, possibly with dots (e.g. "background.color") */
  name: string
  /** Path in the JSON object (e.g. ["background", "color"]) */
  jsonPath: string[]
  /** The JSON Schema type of the leaf value. `string-array` is a closed-enum
   * array of strings, encoded in markup as a comma-separated list. */
  type: 'string' | 'number' | 'integer' | 'boolean' | 'string-array'
  /** For enum attributes: the allowed values */
  enumValues?: (string | number)[]
  /** Whether the property is required */
  required: boolean
  /** Default value from the schema */
  default?: unknown
  /** Locale → title for the attribute itself. Omitted when no title is declared in the schema. */
  titles?: Record<string, string>
  /** For enum attributes: per-value localized titles, keyed by value coerced to string. Omitted when no branch carries a title. */
  enumTitles?: Record<string, Record<string, string>>
}
```

- [ ] **Step 2: Verify type-check**

Run: `npm run check-types`
Expected: success (existing code still compiles — new fields are all optional).

- [ ] **Step 3: Commit**

```bash
git add shared/markup/types.ts
git commit -m "feat(markup): add titles fields to descriptor types"
```

---

## Task 3: Analyzer — extract titles from the schema

**Files:**
- Modify: `build/markup/schema-analyzer.ts`
- Create: `tests/features/markup/analyzer-titles.unit.spec.ts`

- [ ] **Step 1: Write failing analyzer test**

Create `tests/features/markup/analyzer-titles.unit.spec.ts`:

```typescript
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { analyzeSchemas } from '../../../build/markup/schema-analyzer.ts'

// Minimal root schema mimicking the makeLocalDefs output: a $defs.element.oneOf
// referencing one variant with `title` + `x-i18n-title`, and an attribute with
// an enum whose branches carry titles.
function rootSchema () {
  return {
    $defs: {
      element: {
        oneOf: [{ $ref: '#/$defs/titleElement' }]
      },
      titleElement: {
        type: 'object',
        title: 'Title',
        'x-i18n-title': { fr: 'Titre' },
        required: ['type'],
        properties: {
          type: { const: 'title' },
          titleSize: {
            type: 'string',
            title: 'Title size',
            'x-i18n-title': { fr: 'Taille du titre' },
            oneOf: [
              { const: 'h1', title: 'Titre principal' },
              { const: 'h2', title: 'Grand' }
            ]
          },
          content: { type: 'string' }
        }
      }
    }
  }
}

test.describe('analyzer titles', () => {
  test('extracts tag titles from title + x-i18n-title', () => {
    const descriptors = analyzeSchemas(rootSchema())
    const title = descriptors.title
    assert.deepEqual(title.titles, { en: 'Title', fr: 'Titre' })
  })

  test('extracts attribute titles', () => {
    const descriptors = analyzeSchemas(rootSchema())
    const attr = descriptors.title.attributes.find(a => a.name === 'titleSize')
    assert.ok(attr)
    assert.deepEqual(attr!.titles, { en: 'Title size', fr: 'Taille du titre' })
  })

  test('extracts enum-value titles keyed by const-as-string', () => {
    const descriptors = analyzeSchemas(rootSchema())
    const attr = descriptors.title.attributes.find(a => a.name === 'titleSize')
    assert.ok(attr)
    assert.deepEqual(attr!.enumTitles, {
      h1: { en: 'Titre principal' },
      h2: { en: 'Grand' }
    })
  })

  test('omits titles when schema has none', () => {
    const schema = {
      $defs: {
        element: { oneOf: [{ $ref: '#/$defs/plain' }] },
        plain: {
          type: 'object',
          required: ['type'],
          properties: {
            type: { const: 'plain' },
            flag: { type: 'boolean' }
          }
        }
      }
    }
    const descriptors = analyzeSchemas(schema)
    assert.equal(descriptors.plain.titles, undefined)
    const attr = descriptors.plain.attributes.find(a => a.name === 'flag')
    assert.equal(attr?.titles, undefined)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test-unit -- tests/features/markup/analyzer-titles.unit.spec.ts`
Expected: 4 tests fail with assertion mismatches (titles undefined / not populated).

- [ ] **Step 3: Add title-extraction helpers to the analyzer**

In `build/markup/schema-analyzer.ts`, add these two helpers near the top of the file, just after the `VIRTUAL_TAG_NAMES` constant (around line 24):

```typescript
// ---------------------------------------------------------------------------
// Title extraction
// ---------------------------------------------------------------------------

/**
 * Build a localized titles map from a schema node's `title` and `x-i18n-title`.
 * Convention: `title` is the English value (unless author wrote another language — we pass it
 * through as `en`); `x-i18n-title` is a `{ locale: string }` map that is merged on top.
 * Returns undefined when no title is declared.
 */
function extractTitles (schema: Schema): Record<string, string> | undefined {
  const out: Record<string, string> = {}
  if (typeof schema.title === 'string' && schema.title !== '') out.en = schema.title
  const i18n = schema['x-i18n-title']
  if (i18n && typeof i18n === 'object') {
    for (const [loc, value] of Object.entries(i18n as Record<string, unknown>)) {
      if (typeof value === 'string' && value !== '') out[loc] = value
    }
  }
  return Object.keys(out).length > 0 ? out : undefined
}

/**
 * Build a per-value titles map for an enum-like schema (oneOf with consts that
 * may carry titles). Keyed by the const coerced to a string.
 * Returns undefined if no branch carries a title.
 */
function extractEnumTitles (schema: Schema): Record<string, Record<string, string>> | undefined {
  const source = schema.type === 'array' ? schema.items : schema
  if (!source?.oneOf) return undefined
  const out: Record<string, Record<string, string>> = {}
  for (const branch of source.oneOf) {
    if (branch.const === undefined) continue
    const titles = extractTitles(branch)
    if (titles) out[String(branch.const)] = titles
  }
  return Object.keys(out).length > 0 ? out : undefined
}
```

- [ ] **Step 4: Populate `TagDescriptor.titles`**

In `build/markup/schema-analyzer.ts`, find the end of `analyzeElement` where the return statement lives (around line 125):

Before:
```typescript
  sortAttributes(attributes, layoutOrder)

  return { tagName, contentProperty, childrenSlots, attributes, hiddenProperties }
}
```

After:
```typescript
  sortAttributes(attributes, layoutOrder)

  const descriptor: TagDescriptor = { tagName, contentProperty, childrenSlots, attributes, hiddenProperties }
  const titles = extractTitles(elementSchema)
  if (titles) descriptor.titles = titles
  return descriptor
}
```

- [ ] **Step 5: Populate `AttributeDescriptor.titles` and `enumTitles`**

In `build/markup/schema-analyzer.ts`, find `makeAttributeDescriptor` (around line 302).

Before:
```typescript
function makeAttributeDescriptor (
  name: string,
  jsonPath: string[],
  propSchema: Schema,
  required: boolean
): AttributeDescriptor | null {
  const type = getLeafType(propSchema)
  if (!type) return null

  const attr: AttributeDescriptor = { name, jsonPath, type, required }
  const enumValues = extractEnumValues(propSchema)
  if (enumValues) attr.enumValues = enumValues
  if (propSchema.default !== undefined) attr.default = propSchema.default

  return attr
}
```

After:
```typescript
function makeAttributeDescriptor (
  name: string,
  jsonPath: string[],
  propSchema: Schema,
  required: boolean
): AttributeDescriptor | null {
  const type = getLeafType(propSchema)
  if (!type) return null

  const attr: AttributeDescriptor = { name, jsonPath, type, required }
  const enumValues = extractEnumValues(propSchema)
  if (enumValues) attr.enumValues = enumValues
  if (propSchema.default !== undefined) attr.default = propSchema.default
  const titles = extractTitles(propSchema)
  if (titles) attr.titles = titles
  const enumTitles = extractEnumTitles(propSchema)
  if (enumTitles) attr.enumTitles = enumTitles

  return attr
}
```

- [ ] **Step 6: Populate `ChildrenSlot.titles`**

In `build/markup/schema-analyzer.ts`, find `classifyAsChildrenSlot` (around line 138).

Three return sites need to be updated. For each slot creation, extract titles from `propSchema` and attach.

Before:
```typescript
  // Case 1: Array of page elements (items ref to page-elements#/$defs/element)
  if (isElementRef(items)) {
    const virtualTag = getChildrenVirtualTag(propName, hasBothChildrenSlots)
    return { property: propName, virtualTag, kind: 'direct' }
  }

  // Case 2: Structured container — items are objects with a `children` sub-prop holding elements
  const resolvedItems = resolveProperty(rootSchema, items)
  if (resolvedItems.type === 'object' && resolvedItems.properties?.children) {
    const childrenProp = resolvedItems.properties.children
    if (childrenProp.items && isElementRef(childrenProp.items)) {
      const virtualTag = VIRTUAL_TAG_NAMES[propName] || propName
      const itemAttributes = extractItemAttributes(resolvedItems, rootSchema)
      return { property: propName, virtualTag, kind: 'structured', itemAttributes }
    }
  }

  // Case 3: Link item arrays (items $ref to linkItem or simpleLinkItem)
  if (items.$ref && LINK_ITEM_REFS.has(items.$ref)) {
    const virtualTag = VIRTUAL_TAG_NAMES[propName] || propName
    const linkSchema = resolveRef(rootSchema, items.$ref)
    const itemAttributes = extractLinkItemAttributes(linkSchema, rootSchema)
    return { property: propName, virtualTag, kind: 'link', itemAttributes }
  }
```

After:
```typescript
  const slotTitles = extractTitles(propSchema)

  // Case 1: Array of page elements (items ref to page-elements#/$defs/element)
  if (isElementRef(items)) {
    const virtualTag = getChildrenVirtualTag(propName, hasBothChildrenSlots)
    const slot: ChildrenSlot = { property: propName, virtualTag, kind: 'direct' }
    if (slotTitles) slot.titles = slotTitles
    return slot
  }

  // Case 2: Structured container — items are objects with a `children` sub-prop holding elements
  const resolvedItems = resolveProperty(rootSchema, items)
  if (resolvedItems.type === 'object' && resolvedItems.properties?.children) {
    const childrenProp = resolvedItems.properties.children
    if (childrenProp.items && isElementRef(childrenProp.items)) {
      const virtualTag = VIRTUAL_TAG_NAMES[propName] || propName
      const itemAttributes = extractItemAttributes(resolvedItems, rootSchema)
      const slot: ChildrenSlot = { property: propName, virtualTag, kind: 'structured', itemAttributes }
      if (slotTitles) slot.titles = slotTitles
      return slot
    }
  }

  // Case 3: Link item arrays (items $ref to linkItem or simpleLinkItem)
  if (items.$ref && LINK_ITEM_REFS.has(items.$ref)) {
    const virtualTag = VIRTUAL_TAG_NAMES[propName] || propName
    const linkSchema = resolveRef(rootSchema, items.$ref)
    const itemAttributes = extractLinkItemAttributes(linkSchema, rootSchema)
    const slot: ChildrenSlot = { property: propName, virtualTag, kind: 'link', itemAttributes }
    if (slotTitles) slot.titles = slotTitles
    return slot
  }
```

- [ ] **Step 7: Run analyzer tests — expect pass**

Run: `npm run test-unit -- tests/features/markup/analyzer-titles.unit.spec.ts`
Expected: 4 tests pass.

- [ ] **Step 8: Run existing markup tests — expect no regressions**

Run: `npm run test-unit -- tests/features/markup/`
Expected: all pre-existing markup tests pass (round-trip, serializer, deserializer unchanged by this task).

- [ ] **Step 9: Commit**

```bash
git add build/markup/schema-analyzer.ts tests/features/markup/analyzer-titles.unit.spec.ts
git commit -m "feat(markup): extract localized titles in schema analyzer"
```

---

## Task 4: Regenerate descriptors and verify

**Files:**
- Regenerate: `shared/markup/tag-descriptors.ts`
- Create: `tests/features/markup/descriptor-titles.unit.spec.ts`

- [ ] **Step 1: Regenerate descriptors**

Run: `npm run build-types`
Expected: runs without error; prints something like `Generated .../tag-descriptors.ts with 38 element descriptors`.

- [ ] **Step 2: Write failing verification test**

Create `tests/features/markup/descriptor-titles.unit.spec.ts`:

```typescript
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { tagDescriptors } from '../../../shared/markup/tag-descriptors.ts'

test.describe('generated tag descriptors', () => {
  test('title element has localized titles', () => {
    const titleDesc = tagDescriptors.title
    assert.ok(titleDesc, 'title descriptor exists')
    assert.ok(titleDesc.titles, 'titles populated')
    // The schema declares title="TitleElement" + x-i18n-title: { en: 'Title', fr: 'Titre' }
    // so `en` should resolve to one of those and `fr` to the French variant.
    assert.ok(titleDesc.titles.en, 'english title present')
    assert.ok(titleDesc.titles.fr, 'french title present')
  })

  test('at least one attribute carries titles', () => {
    const titleDesc = tagDescriptors.title
    const attrWithTitles = titleDesc.attributes.find(a => a.titles)
    assert.ok(attrWithTitles, 'at least one attribute should carry titles')
  })

  test('titleSize enum carries per-value titles', () => {
    const titleDesc = tagDescriptors.title
    const titleSize = titleDesc.attributes.find(a => a.name === 'titleSize')
    assert.ok(titleSize, 'titleSize attribute exists')
    assert.ok(titleSize!.enumTitles, 'enumTitles populated on titleSize')
    // 'h1' is one of its values; should have a title (any locale).
    const h1Titles = titleSize!.enumTitles!.h1
    assert.ok(h1Titles, 'h1 branch has titles')
    assert.ok(Object.keys(h1Titles).length > 0, 'h1 title is non-empty')
  })
})
```

- [ ] **Step 3: Run — expect pass**

Run: `npm run test-unit -- tests/features/markup/descriptor-titles.unit.spec.ts`
Expected: 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add shared/markup/tag-descriptors.ts tests/features/markup/descriptor-titles.unit.spec.ts
git commit -m "chore(markup): regenerate descriptors with titles"
```

---

## Task 5: Completion source — tag name branch

**Files:**
- Create: `shared/markup/codemirror/completion.ts`
- Create: `tests/features/markup/completion.unit.spec.ts`

- [ ] **Step 1: Write failing test for tag-name completion**

Create `tests/features/markup/completion.unit.spec.ts`:

```typescript
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { EditorState } from '@codemirror/state'
import { CompletionContext, type Completion, type CompletionResult } from '@codemirror/autocomplete'
import { portalMarkupLanguage } from '../../../shared/markup/codemirror/language.ts'
import { portalMarkupCompletion } from '../../../shared/markup/codemirror/completion.ts'

function runCompletion (doc: string, locale = 'en'): CompletionResult | null {
  const cursor = doc.indexOf('|')
  assert.notEqual(cursor, -1, 'doc must contain a | marker for the cursor')
  const text = doc.slice(0, cursor) + doc.slice(cursor + 1)
  const state = EditorState.create({ doc: text, extensions: [portalMarkupLanguage] })
  const ctx = new CompletionContext(state, cursor, false)
  const source = portalMarkupCompletion(locale)
  const res = source(ctx)
  return res instanceof Promise ? null : (res ?? null)
}

function labels (r: CompletionResult | null): string[] {
  return (r?.options ?? []).map((o: Completion) => o.label)
}

test.describe('markup completion — tag names', () => {
  test('suggests real tags after "<"', () => {
    const r = runCompletion('<|')
    const found = labels(r)
    assert.ok(found.includes('title'), 'includes <title>')
    assert.ok(found.includes('banner'), 'includes <banner>')
  })

  test('suggests virtual tags too', () => {
    const r = runCompletion('<|')
    const found = labels(r)
    assert.ok(found.includes('tab'), 'includes virtual <tab>')
    assert.ok(found.includes('left'), 'includes virtual <left>')
    assert.ok(found.includes('action'), 'includes virtual <action>')
  })

  test('filters by partial prefix', () => {
    const r = runCompletion('<tit|')
    const found = labels(r)
    // CodeMirror applies filtering via `validFor` / its filter engine at runtime;
    // the source should still surface 'title' in the options list so CM can filter.
    assert.ok(found.includes('title'))
  })

  test('returns localized detail in fr', () => {
    const r = runCompletion('<|', 'fr')
    const title = (r?.options ?? []).find((o: Completion) => o.label === 'title')
    assert.ok(title, 'title option present')
    // The french title for the Title element in this project is 'Titre'
    assert.ok(typeof title!.detail === 'string' && title!.detail.length > 0, 'has a detail')
  })
})
```

- [ ] **Step 2: Run — expect failure**

Run: `npm run test-unit -- tests/features/markup/completion.unit.spec.ts`
Expected: FAIL with `Cannot find module '../../../shared/markup/codemirror/completion.ts'`.

- [ ] **Step 3: Create the completion source with the tag-name branch**

Create `shared/markup/codemirror/completion.ts`:

```typescript
import type { CompletionContext, CompletionResult, CompletionSource, Completion } from '@codemirror/autocomplete'
import type { SyntaxNode } from '@lezer/common'
import { syntaxTree } from '@codemirror/language'
import type { AttributeDescriptor } from '../types.ts'
import { tagDescriptors } from '../tag-descriptors.ts'

function localized (titles: Record<string, string> | undefined, locale: string): string | undefined {
  if (!titles) return undefined
  return titles[locale] ?? titles.en ?? Object.values(titles)[0]
}

function findAncestor (node: SyntaxNode | null, names: string[]): SyntaxNode | null {
  let n = node
  while (n) {
    if (names.includes(n.name)) return n
    n = n.parent
  }
  return null
}

/**
 * Collect every unique virtual-tag name and its titles across all descriptors.
 * Cached on first use.
 */
let _virtualTagsCache: Array<{ name: string, titles?: Record<string, string> }> | null = null
function virtualTagList () {
  if (_virtualTagsCache) return _virtualTagsCache
  const seen = new Map<string, Record<string, string> | undefined>()
  for (const desc of Object.values(tagDescriptors)) {
    for (const slot of desc.childrenSlots) {
      if (!slot.virtualTag || seen.has(slot.virtualTag)) continue
      seen.set(slot.virtualTag, slot.titles)
    }
  }
  _virtualTagsCache = [...seen.entries()].map(([name, titles]) => ({ name, titles }))
  return _virtualTagsCache
}

function tagNameOptions (locale: string): Completion[] {
  const out: Completion[] = []
  for (const [name, desc] of Object.entries(tagDescriptors)) {
    out.push({ label: name, detail: localized(desc.titles, locale), type: 'class' })
  }
  for (const vt of virtualTagList()) {
    out.push({ label: vt.name, detail: localized(vt.titles, locale), type: 'keyword' })
  }
  return out
}

/**
 * Decide which of three contexts the cursor is in:
 * - tagname:  inside `<foo` opening a tag name
 * - attrname: after tag name, in attribute-name position (not inside a value)
 * - attrvalue: between the quotes of an attribute value
 * Returns null when context is unclear (no completion).
 */
function detectContext (ctx: CompletionContext): { kind: 'tagname' } | null {
  const state = ctx.state
  const tree = syntaxTree(state)
  const node = tree.resolveInner(ctx.pos, -1)

  // Tag-name context: the cursor is inside a TagName node, OR immediately after a `<`
  // that has not yet resolved into a TagName (partial parse).
  if (findAncestor(node, ['TagName'])) return { kind: 'tagname' }

  // Fallback text-based probe for the partial-parse case: "<" followed by optional name.
  const before = ctx.matchBefore(/<[A-Za-z][A-Za-z0-9_-]*/)
  if (before) return { kind: 'tagname' }

  return null
}

export function portalMarkupCompletion (locale: string): CompletionSource {
  return (ctx: CompletionContext): CompletionResult | null => {
    const which = detectContext(ctx)
    if (!which) return null

    if (which.kind === 'tagname') {
      // Replace from just after the "<" (or from the start of the partial name).
      const partial = ctx.matchBefore(/<[A-Za-z0-9_-]*/)
      const from = partial ? partial.from + 1 : ctx.pos
      return {
        from,
        to: ctx.pos,
        options: tagNameOptions(locale),
        validFor: /^[A-Za-z0-9_-]*$/
      }
    }

    return null
  }
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npm run test-unit -- tests/features/markup/completion.unit.spec.ts`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add shared/markup/codemirror/completion.ts tests/features/markup/completion.unit.spec.ts
git commit -m "feat(markup): add tag-name autocomplete"
```

---

## Task 6: Completion source — attribute name branch

**Files:**
- Modify: `shared/markup/codemirror/completion.ts`
- Modify: `tests/features/markup/completion.unit.spec.ts`

- [ ] **Step 1: Add failing tests**

Append to `tests/features/markup/completion.unit.spec.ts` before the final closing brace:

```typescript
test.describe('markup completion — attribute names', () => {
  test('suggests attributes of a real tag', () => {
    const r = runCompletion('<title |')
    const found = labels(r)
    assert.ok(found.includes('titleSize'), 'titleSize present')
    assert.ok(found.includes('centered'), 'centered present')
  })

  test('does not suggest attributes of unrelated tags', () => {
    const r = runCompletion('<title |')
    const found = labels(r)
    // 'elevation' is a card attribute, not a title attribute
    assert.equal(found.includes('elevation'), false)
  })

  test('suggests itemAttributes for a virtual tag', () => {
    const r = runCompletion('<tabs>\n  <tab |\n</tabs>')
    const found = labels(r)
    // <tab> carries `title` as an itemAttribute of the tabs slot
    assert.ok(found.includes('title'), 'virtual <tab> exposes its title attr')
  })

  test('returns null for unknown tag', () => {
    const r = runCompletion('<nonsense |')
    assert.equal(r, null)
  })
})
```

- [ ] **Step 2: Run — expect failures**

Run: `npm run test-unit -- tests/features/markup/completion.unit.spec.ts`
Expected: 4 new tests fail (completion returns null in attribute-name position).

- [ ] **Step 3: Extend `completion.ts` with the attribute-name branch**

In `shared/markup/codemirror/completion.ts`:

3a. Extend the `detectContext` return type and logic. Replace:

```typescript
function detectContext (ctx: CompletionContext): { kind: 'tagname' } | null {
  const state = ctx.state
  const tree = syntaxTree(state)
  const node = tree.resolveInner(ctx.pos, -1)

  // Tag-name context: the cursor is inside a TagName node, OR immediately after a `<`
  // that has not yet resolved into a TagName (partial parse).
  if (findAncestor(node, ['TagName'])) return { kind: 'tagname' }

  // Fallback text-based probe for the partial-parse case: "<" followed by optional name.
  const before = ctx.matchBefore(/<[A-Za-z][A-Za-z0-9_-]*/)
  if (before) return { kind: 'tagname' }

  return null
}
```

with:

```typescript
type Context =
  | { kind: 'tagname' }
  | { kind: 'attrname', tagName: string }

function textOf (state: { sliceDoc: (from: number, to: number) => string }, node: SyntaxNode): string {
  return state.sliceDoc(node.from, node.to)
}

function findTagNameText (state: { sliceDoc: (from: number, to: number) => string }, openOrSelf: SyntaxNode): string | null {
  const tagNameNode = openOrSelf.getChild('TagName')
  return tagNameNode ? textOf(state, tagNameNode) : null
}

function detectContext (ctx: CompletionContext): Context | null {
  const state = ctx.state
  const tree = syntaxTree(state)
  const node = tree.resolveInner(ctx.pos, -1)

  // --- Tag-name context ---
  if (findAncestor(node, ['TagName'])) return { kind: 'tagname' }

  // --- Attribute-name context ---
  // We're inside an OpenTag/SelfClosingTag but outside its TagName and outside
  // any AttributeValue (which handles the value branch).
  const openTag = findAncestor(node, ['OpenTag', 'SelfClosingTag'])
  const valueNode = findAncestor(node, ['AttributeValue', 'String'])
  if (openTag && !valueNode) {
    const tagName = findTagNameText(state, openTag)
    if (tagName) return { kind: 'attrname', tagName }
  }

  // --- Fallback text-based probe for partial "<x" parse ---
  const before = ctx.matchBefore(/<[A-Za-z][A-Za-z0-9_-]*/)
  if (before) return { kind: 'tagname' }

  return null
}
```

3b. Add an attribute-lookup helper and the attribute-name emission. After `virtualTagList()` and before `tagNameOptions`, add:

```typescript
/**
 * Resolve the attribute list for a tag name.
 * - Real tag: returns `descriptor.attributes`.
 * - Virtual tag: scans every descriptor's childrenSlots for a matching
 *   `virtualTag` and returns that slot's `itemAttributes`.
 * - Unknown: returns null.
 */
function attributesForTag (tagName: string): AttributeDescriptor[] | null {
  const real = tagDescriptors[tagName]
  if (real) return real.attributes
  for (const desc of Object.values(tagDescriptors)) {
    for (const slot of desc.childrenSlots) {
      if (slot.virtualTag === tagName && slot.itemAttributes) return slot.itemAttributes
    }
  }
  return null
}

function attributeNameOptions (attrs: AttributeDescriptor[], locale: string): Completion[] {
  return attrs.map(attr => ({
    label: attr.name,
    detail: localized(attr.titles, locale),
    type: 'property' as const,
    info: attr.required ? 'required' : undefined,
    apply: (view: any, _c: Completion, from: number, to: number) => {
      view.dispatch({
        changes: { from, to, insert: `${attr.name}=""` },
        selection: { anchor: from + attr.name.length + 2 }
      })
    }
  }))
}
```

3c. Wire the branch in `portalMarkupCompletion`. Replace the function body:

```typescript
export function portalMarkupCompletion (locale: string): CompletionSource {
  return (ctx: CompletionContext): CompletionResult | null => {
    const which = detectContext(ctx)
    if (!which) return null

    if (which.kind === 'tagname') {
      const partial = ctx.matchBefore(/<[A-Za-z0-9_-]*/)
      const from = partial ? partial.from + 1 : ctx.pos
      return {
        from,
        to: ctx.pos,
        options: tagNameOptions(locale),
        validFor: /^[A-Za-z0-9_-]*$/
      }
    }

    if (which.kind === 'attrname') {
      const attrs = attributesForTag(which.tagName)
      if (!attrs) return null
      const partial = ctx.matchBefore(/[A-Za-z][A-Za-z0-9_.\-]*/)
      const from = partial ? partial.from : ctx.pos
      return {
        from,
        to: ctx.pos,
        options: attributeNameOptions(attrs, locale),
        validFor: /^[A-Za-z0-9_.\-]*$/
      }
    }

    return null
  }
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npm run test-unit -- tests/features/markup/completion.unit.spec.ts`
Expected: all 8 tests pass (4 tag-name + 4 attribute-name).

- [ ] **Step 5: Commit**

```bash
git add shared/markup/codemirror/completion.ts tests/features/markup/completion.unit.spec.ts
git commit -m "feat(markup): add attribute-name autocomplete"
```

---

## Task 7: Completion source — attribute value branch

**Files:**
- Modify: `shared/markup/codemirror/completion.ts`
- Modify: `tests/features/markup/completion.unit.spec.ts`

- [ ] **Step 1: Add failing tests**

Append to `tests/features/markup/completion.unit.spec.ts` before the final closing brace:

```typescript
test.describe('markup completion — attribute values', () => {
  test('suggests enum values for enum attribute', () => {
    const r = runCompletion('<title titleSize="|"')
    const found = labels(r)
    assert.ok(found.includes('h1'), 'h1 present')
    assert.ok(found.includes('h2'), 'h2 present')
  })

  test('suggests true/false for boolean attribute', () => {
    const r = runCompletion('<title centered="|"')
    const found = labels(r)
    assert.deepEqual(found.sort(), ['false', 'true'])
  })

  test('returns null for free-text (non-enum, non-boolean) attribute', () => {
    const r = runCompletion('<title content="|"')
    assert.equal(r, null)
  })

  test('returns null for unknown tag in value context', () => {
    const r = runCompletion('<nonsense foo="|"')
    assert.equal(r, null)
  })
})
```

- [ ] **Step 2: Run — expect failures**

Run: `npm run test-unit -- tests/features/markup/completion.unit.spec.ts`
Expected: the 4 new tests fail (no value completion yet).

- [ ] **Step 3: Extend context detection and add the value branch**

In `shared/markup/codemirror/completion.ts`:

3a. Extend the `Context` union type:

```typescript
type Context =
  | { kind: 'tagname' }
  | { kind: 'attrname', tagName: string }
  | { kind: 'attrvalue', tagName: string, attrName: string, valueFrom: number, valueTo: number }
```

3b. Extend `detectContext` — insert this block **before** the attrname detection (so attrvalue wins when both could match):

```typescript
  // --- Attribute-value context ---
  // Cursor sits inside an AttributeValue (between the quotes).
  const valueNode = findAncestor(node, ['AttributeValue', 'String'])
  const openTagForValue = findAncestor(node, ['OpenTag', 'SelfClosingTag'])
  if (valueNode && openTagForValue) {
    // The AttributeValue wraps a String token. Find the surrounding Attribute
    // so we can grab its name.
    const attrNode = findAncestor(valueNode, ['Attribute'])
    if (attrNode) {
      const nameNode = attrNode.getChild('AttributeName')
      if (nameNode) {
        const attrName = textOf(state, nameNode)
        // Narrow from/to to just inside the quotes.
        // AttributeValue's text is `"..."` — offsets +1 / -1 from its bounds.
        const valueFrom = valueNode.from + 1
        const valueTo = valueNode.to - 1
        const tagName = findTagNameText(state, openTagForValue)
        if (tagName) return { kind: 'attrvalue', tagName, attrName, valueFrom, valueTo }
      }
    }
  }
```

⚠️ Place this block *above* the existing attrname detection. The final `detectContext` should try attrvalue first, then tagname, then attrname, then the fallback probe. Keep the tagname-before-attrname order — a cursor inside `TagName` should not be misread as attrname because TagName ancestors are distinct from Attribute ancestors.

3c. Add value-options helpers. After `attributeNameOptions`, add:

```typescript
function findAttributeDescriptor (tagName: string, attrName: string): AttributeDescriptor | null {
  const attrs = attributesForTag(tagName)
  if (!attrs) return null
  return attrs.find(a => a.name === attrName) ?? null
}

function valueOptionsFor (attr: AttributeDescriptor, locale: string): Completion[] | null {
  if (attr.enumValues && attr.enumValues.length > 0) {
    return attr.enumValues.map(v => {
      const s = String(v)
      return {
        label: s,
        detail: localized(attr.enumTitles?.[s], locale),
        type: 'enum' as const
      }
    })
  }
  if (attr.type === 'boolean') {
    return [
      { label: 'true', type: 'constant' as const },
      { label: 'false', type: 'constant' as const }
    ]
  }
  return null
}
```

3d. Wire the branch in `portalMarkupCompletion`:

```typescript
    if (which.kind === 'attrvalue') {
      const attr = findAttributeDescriptor(which.tagName, which.attrName)
      if (!attr) return null
      const options = valueOptionsFor(attr, locale)
      if (!options) return null
      return {
        from: which.valueFrom,
        to: which.valueTo,
        options,
        validFor: /^[^"]*$/
      }
    }
```

The final function body becomes (for reference — replace your current `portalMarkupCompletion`):

```typescript
export function portalMarkupCompletion (locale: string): CompletionSource {
  return (ctx: CompletionContext): CompletionResult | null => {
    const which = detectContext(ctx)
    if (!which) return null

    if (which.kind === 'attrvalue') {
      const attr = findAttributeDescriptor(which.tagName, which.attrName)
      if (!attr) return null
      const options = valueOptionsFor(attr, locale)
      if (!options) return null
      return {
        from: which.valueFrom,
        to: which.valueTo,
        options,
        validFor: /^[^"]*$/
      }
    }

    if (which.kind === 'tagname') {
      const partial = ctx.matchBefore(/<[A-Za-z0-9_-]*/)
      const from = partial ? partial.from + 1 : ctx.pos
      return {
        from,
        to: ctx.pos,
        options: tagNameOptions(locale),
        validFor: /^[A-Za-z0-9_-]*$/
      }
    }

    if (which.kind === 'attrname') {
      const attrs = attributesForTag(which.tagName)
      if (!attrs) return null
      const partial = ctx.matchBefore(/[A-Za-z][A-Za-z0-9_.\-]*/)
      const from = partial ? partial.from : ctx.pos
      return {
        from,
        to: ctx.pos,
        options: attributeNameOptions(attrs, locale),
        validFor: /^[A-Za-z0-9_.\-]*$/
      }
    }

    return null
  }
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npm run test-unit -- tests/features/markup/completion.unit.spec.ts`
Expected: all 12 tests pass (4 tag-name + 4 attribute-name + 4 attribute-value).

- [ ] **Step 5: Commit**

```bash
git add shared/markup/codemirror/completion.ts tests/features/markup/completion.unit.spec.ts
git commit -m "feat(markup): add attribute-value autocomplete"
```

---

## Task 8: Wire completion into CodeMirror extensions

**Files:**
- Modify: `shared/markup/codemirror/index.ts`

- [ ] **Step 1: Update extensions bundle**

Replace the contents of `shared/markup/codemirror/index.ts` with:

```typescript
import type { Extension } from '@codemirror/state'
import { autocompletion } from '@codemirror/autocomplete'
import { portalMarkup } from './language.ts'
import { portalMarkupLinter } from './validation.ts'
import { portalMarkupCompletion } from './completion.ts'

export { portalMarkup, portalMarkupLanguage } from './language.ts'
export { portalMarkupLinter } from './validation.ts'
export { portalMarkupCompletion } from './completion.ts'

/**
 * Bundle of extensions for the page-edit markup editor:
 * language support (highlighting, folding, indentation) + autocomplete
 * (tag names, attribute names, enum/boolean values) + lint diagnostics.
 */
export function portalMarkupExtensions (opts: { locale: string }): Extension[] {
  return [
    portalMarkup(),
    autocompletion({ override: [portalMarkupCompletion(opts.locale)] }),
    portalMarkupLinter
  ]
}
```

- [ ] **Step 2: Verify type-check**

Run: `npm run check-types`
Expected: success. (The `page-edit-elements-markup.vue` will now fail to type-check because `portalMarkupExtensions()` requires the `locale` option — Task 9 fixes this.)

If type-check fails at `page-edit-elements-markup.vue` about the new required `locale`, that's the expected intermediate state. Proceed to Task 9 before attempting a final clean type-check.

- [ ] **Step 3: Commit**

```bash
git add shared/markup/codemirror/index.ts
git commit -m "feat(markup): include autocomplete in extensions bundle"
```

---

## Task 9: Thread locale and completionKeymap through the Vue component

**Files:**
- Modify: `ui/src/components/page-edit/page-edit-elements-markup.vue`

- [ ] **Step 1: Update the script block**

Open `ui/src/components/page-edit/page-edit-elements-markup.vue`.

1a. Replace the `@codemirror/commands` import to also pull `history`, `historyKeymap` (unchanged) and add the autocomplete keymap import. Replace the existing imports block (lines 9–16):

```typescript
import type { PageElement } from '#api/types/page-elements/index.ts'
import { serializeElements, deserializeElements } from '@data-fair/portals-shared-markup'
import { portalMarkupExtensions } from '@data-fair/portals-shared-markup/codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { forEachDiagnostic, lintKeymap } from '@codemirror/lint'
import { completionKeymap } from '@codemirror/autocomplete'
```

1b. Below the existing `const elements = defineModel<...>(...)` line, add the locale import and ref:

```typescript
const { locale } = useI18n()
```

(`useI18n` is auto-imported by the existing setup in this repo — `unplugin-auto-import`. If a lint error says `useI18n is not defined`, add an explicit `import { useI18n } from 'vue-i18n'` at the top of the script.)

1c. Update `buildExtensions` to take a locale and include `completionKeymap`. Replace the current `buildExtensions` function:

```typescript
function buildExtensions (locale: string) {
  return [
    lineNumbers(),
    foldGutter(),
    history(),
    indentOnInput(),
    bracketMatching(),
    highlightActiveLine(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([...defaultKeymap, ...historyKeymap, ...lintKeymap, ...completionKeymap, indentWithTab]),
    portalMarkupExtensions({ locale }),
    EditorView.updateListener.of((update) => {
      if (!update.docChanged && !update.transactions.some(tr => tr.effects.length)) return
      let count = 0
      forEachDiagnostic(update.state, () => { count++ })
      hasErrors.value = count > 0
    }),
    EditorView.domEventHandlers({
      blur: () => { applyChange() }
    })
  ]
}
```

1d. Update the `onMounted` block to pass the current locale:

Before:
```typescript
onMounted(() => {
  const initial = serializeElements(elements.value ?? [])
  lastExternalText = initial
  view = new EditorView({
    state: EditorState.create({ doc: initial, extensions: buildExtensions() }),
    parent: editorEl.value!
  })
})
```

After:
```typescript
onMounted(() => {
  const initial = serializeElements(elements.value ?? [])
  lastExternalText = initial
  view = new EditorView({
    state: EditorState.create({ doc: initial, extensions: buildExtensions(locale.value) }),
    parent: editorEl.value!
  })
})
```

- [ ] **Step 2: Type-check**

Run: `npm run check-types`
Expected: success across the repo.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: success (no new warnings).

- [ ] **Step 4: Run full markup test suite**

Run: `npm run test-unit -- tests/features/markup/`
Expected: all markup unit tests pass — analyzer-titles (4), descriptor-titles (3), completion (12), plus the pre-existing deserializer/serializer/round-trip tests.

- [ ] **Step 5: Commit**

```bash
git add ui/src/components/page-edit/page-edit-elements-markup.vue
git commit -m "feat(ui): wire locale + completionKeymap into markup editor"
```

---

## Task 10: Manual verification

**Files:** none edited.

- [ ] **Step 1: Check dev services are up**

Run: `bash dev/status.sh`
Expected: all services (nginx, API, UI, portal, docker) are healthy. If any are down, **stop**, report to the user, and do not attempt to restart.

- [ ] **Step 2: Enable markup mode**

In the running UI, open the browser devtools console and run:

```js
localStorage.setItem('df-markup-edit', '1')
```

Reload.

- [ ] **Step 3: Exercise each completion context**

Open a generic page editor (create one if needed) and toggle to **Markup** mode. Perform and observe:

1. Clear the editor. Type `<` → a tag list appears. Confirm real tags (`title`, `banner`) and virtual tags (`tab`, `left`, `action`) show up; confirm `detail` text is localized to the current UI language.
2. Pick a tag (e.g. `<title`), close it properly, then type a space inside the opening tag → an attribute list appears specific to that tag.
3. Accept an enum attribute (e.g. `titleSize`) — the insertion helper should place the cursor between empty quotes.
4. Observe the enum value popup with `h1`, `h2`, … appears; each has a `detail`.
5. Change the UI locale (if the portal supports it) and open Markup mode again → labels shift to the new locale.

- [ ] **Step 4: Ensure no regressions**

Run: `npm run test-unit -- tests/features/markup/`
Expected: all pass.

- [ ] **Step 5: Final commit if anything changed during verification**

If Step 3 surfaced a real issue and required a code fix, commit that fix separately with a clear message. Otherwise, skip this step — there is nothing to commit.

---

## Verification Checklist (final)

1. `npm run build-types` succeeds and the generated `shared/markup/tag-descriptors.ts` carries `titles` fields.
2. `npm run test-unit -- tests/features/markup/` passes all suites (analyzer titles, descriptor titles, completion, and pre-existing serializer/deserializer/round-trip).
3. `npm run check-types` passes.
4. `npm run lint` passes.
5. Manual Task 10 steps 1–4 observed without issue.
