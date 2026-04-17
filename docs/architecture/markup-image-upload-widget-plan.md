# Markup Image-Upload Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an inline image-upload widget to the page-edit markup editor so that `image-upload` slot sites in the JSON Schema render a file-input widget in CM6 instead of raw `_id`/`name`/`mimeType` text.

**Architecture:** Schema analyzer emits an `imageUploadGroups` list on each `TagDescriptor`. A framework-agnostic CM6 `ViewPlugin` (in `shared/markup/codemirror/`) turns those groups into `Decoration.replace` widgets, delegating Vue mounting to a host-provided callback. The UI component (`page-edit-elements-markup.vue`) supplies a Vue-mounting callback that mounts `markup-image-widget.vue`, which reuses the existing `image-upload.vue` component and writes through the shared `StatefulLayout`.

**Tech Stack:** TypeScript, CodeMirror 6 (`@codemirror/state`, `@codemirror/view`), Vue 3, `@json-layout/core`, `@playwright/test` (unit-test runner used by `npm run test-unit`).

---

## File Structure

| File | New/Modified | Responsibility |
|---|---|---|
| `shared/markup/types.ts` | Modified | Add `ImageUploadGroup` interface and `imageUploadGroups?` on `TagDescriptor`. |
| `build/markup/schema-analyzer.ts` | Modified | Detect `layout.slots.component.name === 'image-upload'` during schema walk and emit groups. |
| `shared/markup/tag-descriptors.ts` | Regenerated | Output of `npm run build-types`; now includes `imageUploadGroups` per element. |
| `shared/markup/index.ts` | Modified | Re-export `ImageUploadGroup`. |
| `shared/markup/codemirror/image-upload-widgets.ts` | New | CM6 ViewPlugin factory + pure `computeImageUploadRanges` helper. |
| `shared/markup/codemirror/index.ts` | Modified | Re-export. |
| `ui/src/components/markup-widgets/markup-image-widget.vue` | New | Vue widget used by the plugin's mount callback. |
| `ui/src/components/page-edit/page-edit-elements-markup.vue` | Modified | Wire `mountWidget` callback + add plugin extension. |
| `tests/features/markup/image-upload-group.unit.spec.ts` | New | Schema-analyzer output assertions. |
| `tests/features/markup/image-upload-widgets.unit.spec.ts` | New | `computeImageUploadRanges` assertions. |

All new code is TDD-first: write the failing test, run it, implement, run it again.

---

## Task 1: Add ImageUploadGroup type

**Files:**
- Modify: `shared/markup/types.ts`

- [ ] **Step 1: Add the new interface and field**

Edit `shared/markup/types.ts`. Add the interface after the existing `AttributeDescriptor` interface:

```ts
/**
 * Metadata for an object property whose schema declares an `image-upload`
 * slot. Emitted by the schema analyzer alongside (not instead of) the
 * flattened leaf attributes, so plain-text editing and validation still work.
 *
 * The markup image-upload widget uses this to group the `_id`, `name`,
 * `mimeType`, `mobileAlt` attributes under `jsonPath` into a single inline
 * file-input control in the editor.
 */
export interface ImageUploadGroup {
  /** Path to the image-upload object, e.g. ["image"], ["wideImage"], ["background","image"], ["thumbnail","image"], ["thumbnail","default"]. */
  jsonPath: string[]
  /** width prop from the slot (forwarded to the upload request). */
  width?: number
  /** height prop from the slot. */
  height?: number
  /** label prop from the slot (raw schema value — not localized today). */
  label?: string
}
```

Update `TagDescriptor` to include the new optional field:

```ts
export interface TagDescriptor {
  tagName: string
  contentProperty: string | null
  childrenSlots: ChildrenSlot[]
  attributes: AttributeDescriptor[]
  hiddenProperties: string[]
  /** Locale → title, e.g. { en: "Banner", fr: "Bannière" }. Omitted when no title is declared in the schema. */
  titles?: Record<string, string>
  /** Objects under this tag that declare an image-upload slot. Drives inline widget rendering in markup mode. */
  imageUploadGroups?: ImageUploadGroup[]
}
```

- [ ] **Step 2: Re-export from the public index**

Edit `shared/markup/index.ts` to add `ImageUploadGroup` to the existing type export line:

```ts
export type { TagDescriptor, ChildrenSlot, AttributeDescriptor, ImageUploadGroup, MarkupRange, MarkupSourceMap } from './types.ts'
```

- [ ] **Step 3: Type-check**

Run: `npm run check-types`
Expected: PASS (no usages yet; new optional field is backwards compatible).

- [ ] **Step 4: Commit**

```bash
git add shared/markup/types.ts shared/markup/index.ts
git commit -m "feat(markup): add ImageUploadGroup type on TagDescriptor"
```

---

## Task 2: Schema analyzer test (failing)

**Files:**
- Create: `tests/features/markup/image-upload-group.unit.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/features/markup/image-upload-group.unit.spec.ts`:

```ts
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { tagDescriptors } from '../../../shared/markup/tag-descriptors.ts'

test.describe('image-upload groups in tag descriptors', () => {
  test('<image> element exposes image and wideImage groups', () => {
    const desc = tagDescriptors.image
    assert.ok(desc, 'image descriptor exists')
    const groups = desc.imageUploadGroups ?? []
    const paths = groups.map(g => g.jsonPath.join('.'))
    assert.ok(paths.includes('image'), `expected "image" group, got ${JSON.stringify(paths)}`)
    assert.ok(paths.includes('wideImage'), `expected "wideImage" group, got ${JSON.stringify(paths)}`)
  })

  test('image-upload group carries slot props', () => {
    const desc = tagDescriptors.image
    const image = (desc.imageUploadGroups ?? []).find(g => g.jsonPath.join('.') === 'image')
    assert.ok(image, 'image group present')
    assert.equal(image!.width, 2400)
    assert.equal(image!.label, 'Chargez une image')
  })

  test('banner element exposes background.image group', () => {
    const desc = tagDescriptors.banner
    assert.ok(desc, 'banner descriptor exists')
    const paths = (desc.imageUploadGroups ?? []).map(g => g.jsonPath.join('.'))
    assert.ok(paths.includes('background.image'), `expected "background.image" on banner, got ${JSON.stringify(paths)}`)
  })

  test('card element exposes both background.image and thumbnail.image', () => {
    const desc = tagDescriptors.card
    assert.ok(desc, 'card descriptor exists')
    const paths = (desc.imageUploadGroups ?? []).map(g => g.jsonPath.join('.'))
    assert.ok(paths.includes('background.image'), `card missing background.image: ${JSON.stringify(paths)}`)
    assert.ok(paths.includes('thumbnail.image'), `card missing thumbnail.image: ${JSON.stringify(paths)}`)
  })

  test('datasets-list exposes cardConfig.thumbnail.default as a deep group', () => {
    const desc = tagDescriptors['datasets-list']
    assert.ok(desc, 'datasets-list descriptor exists')
    const paths = (desc.imageUploadGroups ?? []).map(g => g.jsonPath.join('.'))
    assert.ok(
      paths.includes('cardConfig.thumbnail.default'),
      `datasets-list missing cardConfig.thumbnail.default: ${JSON.stringify(paths)}`
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test-unit -- tests/features/markup/image-upload-group.unit.spec.ts`
Expected: FAIL — `imageUploadGroups` is `undefined` on every descriptor because the analyzer doesn't emit it yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/features/markup/image-upload-group.unit.spec.ts
git commit -m "test(markup): add failing image-upload-group descriptor tests"
```

---

## Task 3: Implement schema analyzer detection

**Files:**
- Modify: `build/markup/schema-analyzer.ts`

- [ ] **Step 1: Add a helper for slot detection**

Edit `build/markup/schema-analyzer.ts`. Add near the top of the file, after the `VIRTUAL_TAG_NAMES` constant:

```ts
function getImageUploadSlotProps (schema: Schema): { width?: number, height?: number, label?: string } | null {
  const slot = schema.layout?.slots?.component
  if (!slot || slot.name !== 'image-upload') return null
  const props = slot.props ?? {}
  const out: { width?: number, height?: number, label?: string } = {}
  if (typeof props.width === 'number') out.width = props.width
  if (typeof props.height === 'number') out.height = props.height
  if (typeof props.label === 'string') out.label = props.label
  return out
}
```

- [ ] **Step 2: Thread group collection through `flattenObjectAttributes` and `analyzeElement`**

Replace the existing `flattenObjectAttributes` signature/body with one that accepts an `onImageUploadGroup` sink. Update the top of the function (around line 282) to:

```ts
function flattenObjectAttributes (
  prefix: string,
  basePath: string[],
  objectSchema: Schema,
  parentRequired: boolean,
  rootSchema: Schema,
  depth = 0,
  onImageUploadGroup?: (group: ImageUploadGroup) => void
): AttributeDescriptor[] {
  const attrs: AttributeDescriptor[] = []

  // If this object itself declares an image-upload slot, record a group.
  const slotProps = getImageUploadSlotProps(objectSchema)
  if (slotProps && onImageUploadGroup) {
    const group: ImageUploadGroup = { jsonPath: [...basePath] }
    if (slotProps.width !== undefined) group.width = slotProps.width
    if (slotProps.height !== undefined) group.height = slotProps.height
    if (slotProps.label !== undefined) group.label = slotProps.label
    onImageUploadGroup(group)
  }
```

Keep the rest of the function body unchanged except: pass `onImageUploadGroup` through to the recursive calls:

```ts
if (isObjectSchema(propSchema) && depth < 3) {
  attrs.push(...flattenObjectAttributes(attrName, jsonPath, propSchema, isReq, rootSchema, depth + 1, onImageUploadGroup))
} else {
  const attr = makeAttributeDescriptor(attrName, jsonPath, propSchema, isReq)
  if (attr) attrs.push(attr)
}
```

Repeat the same `onImageUploadGroup` pass-through in the `oneOf` branch (the earlier `if (objectSchema.oneOf && !objectSchema.properties)` block).

Add the import at the top of the file:

```ts
import type { TagDescriptor, ChildrenSlot, AttributeDescriptor, ImageUploadGroup } from '../../shared/markup/types.ts'
```

- [ ] **Step 3: Collect groups in `analyzeElement`**

Modify `analyzeElement` (line ~101). Replace the existing `for (const [propName, rawPropSchema] of Object.entries(properties))` loop with one that collects groups:

```ts
  const imageUploadGroups: ImageUploadGroup[] = []
  const pushGroup = (g: ImageUploadGroup) => imageUploadGroups.push(g)

  for (const [propName, rawPropSchema] of Object.entries(properties)) {
    if (propName === 'type') continue

    const propSchema = resolveProperty(rootSchema, rawPropSchema)

    if (isHidden(propName, propSchema)) {
      hiddenProperties.push(propName)
      continue
    }

    const childrenSlot = classifyAsChildrenSlot(propName, rawPropSchema, propSchema, hasBothChildrenSlots, rootSchema)
    if (childrenSlot) {
      childrenSlots.push(childrenSlot)
      continue
    }

    if (propName === 'content' && getSchemaType(propSchema) === 'string') {
      contentProperty = 'content'
      continue
    }

    if (isObjectSchema(propSchema)) {
      // Top-level object property may itself be an image-upload slot.
      const slotProps = getImageUploadSlotProps(propSchema)
      if (slotProps) {
        const g: ImageUploadGroup = { jsonPath: [propName] }
        if (slotProps.width !== undefined) g.width = slotProps.width
        if (slotProps.height !== undefined) g.height = slotProps.height
        if (slotProps.label !== undefined) g.label = slotProps.label
        imageUploadGroups.push(g)
      }
      attributes.push(...flattenObjectAttributes(propName, [propName], propSchema, requiredSet.has(propName), rootSchema, 0, pushGroup))
      continue
    }

    const attr = makeAttributeDescriptor(propName, [propName], propSchema, requiredSet.has(propName))
    if (attr) attributes.push(attr)
  }
```

Note: the top-level object case is handled separately to avoid the `flattenObjectAttributes` recursion adding `[propName]` to its own basePath — the function gets called with basePath `[propName]`, so if it also records a group for itself, it would duplicate with the case we just added. Remove the duplicate by only recording in `flattenObjectAttributes` when `depth > 0`. Update the top of `flattenObjectAttributes`:

```ts
  const slotProps = getImageUploadSlotProps(objectSchema)
  if (slotProps && onImageUploadGroup && depth > 0) {
    const group: ImageUploadGroup = { jsonPath: [...basePath] }
    if (slotProps.width !== undefined) group.width = slotProps.width
    if (slotProps.height !== undefined) group.height = slotProps.height
    if (slotProps.label !== undefined) group.label = slotProps.label
    onImageUploadGroup(group)
  }
```

Finally, attach the collected groups to the descriptor:

```ts
  const descriptor: TagDescriptor = { tagName, contentProperty, childrenSlots, attributes, hiddenProperties }
  const titles = extractTitles(elementSchema)
  if (titles) descriptor.titles = titles
  if (imageUploadGroups.length > 0) descriptor.imageUploadGroups = imageUploadGroups
  return descriptor
```

- [ ] **Step 4: Regenerate tag descriptors**

Run: `npm run build-types`
Expected: Command completes successfully. `shared/markup/tag-descriptors.ts` is updated in-place with `imageUploadGroups` entries on elements like `image`, `section`, list elements, etc.

- [ ] **Step 5: Run the schema-analyzer test**

Run: `npm run test-unit -- tests/features/markup/image-upload-group.unit.spec.ts`
Expected: PASS — all five tests green.

- [ ] **Step 6: Type-check**

Run: `npm run check-types`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add build/markup/schema-analyzer.ts shared/markup/tag-descriptors.ts tests/features/markup/image-upload-group.unit.spec.ts
git commit -m "feat(markup): analyze image-upload slots into TagDescriptor groups"
```

---

## Task 4: CM6 plugin test (failing) — compute ranges

**Files:**
- Create: `tests/features/markup/image-upload-widgets.unit.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/features/markup/image-upload-widgets.unit.spec.ts`:

```ts
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'
import { tagDescriptors } from '../../../shared/markup/tag-descriptors.ts'
import { computeImageUploadRanges } from '../../../shared/markup/codemirror/image-upload-widgets.ts'

test.describe('image-upload widget range computation', () => {
  test('detects a contiguous image group and returns its span', () => {
    const src = '<image image._id="abc" image.name="photo.jpg" image.mimeType="image/jpeg" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    assert.equal(ranges.length, 1, `expected one range, got ${ranges.length}`)
    const [r] = ranges
    assert.equal(r.elementPointer, '/0')
    assert.equal(r.group.jsonPath.join('.'), 'image')
    // The range should cover the attribute text.
    const covered = src.slice(r.from, r.to)
    assert.ok(covered.includes('image._id'))
    assert.ok(covered.includes('image.mimeType'))
  })

  test('returns no range when attributes are interleaved with unrelated ones', () => {
    const src = '<image image._id="abc" banner="true" image.name="photo.jpg" image.mimeType="image/jpeg" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    assert.equal(ranges.length, 0, 'interleaved attrs should skip the group')
  })

  test('returns no range when not all required leaf attributes are present', () => {
    const src = '<image image._id="abc" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    assert.equal(ranges.length, 0, 'missing leaves should skip the group')
  })

  test('handles two groups on the same element (image and wideImage)', () => {
    const src = [
      '<image',
      '  image._id="a" image.name="a.jpg" image.mimeType="image/jpeg"',
      '  wideImage._id="b" wideImage.name="b.jpg" wideImage.mimeType="image/jpeg"',
      '/>'
    ].join('\n')
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    const paths = ranges.map(r => r.group.jsonPath.join('.')).sort()
    assert.deepEqual(paths, ['image', 'wideImage'])
  })

  test('ignores tags without image-upload groups', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    assert.equal(ranges.length, 0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test-unit -- tests/features/markup/image-upload-widgets.unit.spec.ts`
Expected: FAIL — `computeImageUploadRanges` is not exported from the target module (module not found / import error).

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/features/markup/image-upload-widgets.unit.spec.ts
git commit -m "test(markup): add failing computeImageUploadRanges tests"
```

---

## Task 5: Implement `computeImageUploadRanges` + ViewPlugin

**Files:**
- Create: `shared/markup/codemirror/image-upload-widgets.ts`

- [ ] **Step 1: Create the module with the pure helper and the plugin factory**

Create `shared/markup/codemirror/image-upload-widgets.ts`:

```ts
import { Decoration, ViewPlugin, WidgetType, type EditorView, type DecorationSet, type ViewUpdate } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { deserializeElements } from '../deserializer.ts'
import type { ImageUploadGroup, MarkupSourceMap, TagDescriptor } from '../types.ts'

/**
 * Pure helper: given the current document text, its source map, and the tag
 * descriptors, return the character ranges to replace with image-upload
 * widgets. A group is reported only when all of its leaf attributes are
 * present in the source map AND the min→max span contains only those
 * attributes plus whitespace (i.e. they are contiguous in the markup). This
 * keeps the behavior predictable: interleaved or partial attrs fall back to
 * plain text, and the next serialize cycle normalizes ordering.
 */
export interface ImageUploadRange {
  from: number
  to: number
  elementPointer: string
  group: ImageUploadGroup
}

export function computeImageUploadRanges (
  doc: string,
  sourceMap: MarkupSourceMap,
  tagDescriptors: Record<string, TagDescriptor>
): ImageUploadRange[] {
  const out: ImageUploadRange[] = []

  for (const [elementPointer, elementRange] of sourceMap.byElementPointer) {
    const tagName = readTagName(doc, elementRange.from)
    if (!tagName) continue
    const descriptor = tagDescriptors[tagName]
    if (!descriptor?.imageUploadGroups?.length) continue

    // Collect every attribute range that belongs to this element, keyed by
    // the jsonPath prefix relative to the element pointer.
    const elementAttrs: Array<{ path: string[], from: number, to: number }> = []
    for (const attr of descriptor.attributes) {
      const pointer = `${elementPointer}/${attr.jsonPath.join('/')}`
      const range = sourceMap.byPointer.get(pointer)
      if (!range) continue
      elementAttrs.push({ path: attr.jsonPath, from: range.from, to: range.to })
    }

    for (const group of descriptor.imageUploadGroups) {
      const prefix = group.jsonPath
      const inGroup = elementAttrs.filter(a => startsWithPath(a.path, prefix))
      const outsideGroup = elementAttrs.filter(a => !startsWithPath(a.path, prefix))

      // Need at least _id, name, mimeType under the prefix to render.
      const leafNames = new Set(inGroup.map(a => a.path[prefix.length]).filter(Boolean))
      const required = ['_id', 'name', 'mimeType']
      if (!required.every(r => leafNames.has(r))) continue

      // Attribute ranges point at the *value* span (between quotes). Extend
      // each to cover `name="value"` plus trailing whitespace so the widget
      // hides the whole attribute text.
      const spans = inGroup.map(a => attributeFullSpan(doc, a.from, a.to))
      const min = spans.reduce((m, s) => Math.min(m, s.from), Number.POSITIVE_INFINITY)
      const max = spans.reduce((m, s) => Math.max(m, s.to), 0)

      // Contiguity check: any outside-group attribute whose value or name
      // range falls inside [min, max] means the group is interleaved.
      const interleaved = outsideGroup.some(a => a.from >= min && a.to <= max)
      if (interleaved) continue

      out.push({ from: min, to: max, elementPointer, group })
    }
  }

  return out
}

function startsWithPath (path: string[], prefix: string[]): boolean {
  if (path.length <= prefix.length) return false
  for (let i = 0; i < prefix.length; i++) {
    if (path[i] !== prefix[i]) return false
  }
  return true
}

/** Read the tag name from an opening-tag range (e.g. `<image ...` → `image`). */
function readTagName (doc: string, openTagStart: number): string | null {
  if (doc[openTagStart] !== '<') return null
  let i = openTagStart + 1
  const start = i
  while (i < doc.length && /[A-Za-z0-9-]/.test(doc[i])) i++
  return i > start ? doc.slice(start, i) : null
}

/**
 * Given an attribute-value range (tight between the quotes), walk backwards
 * to the attribute name and forwards past the closing quote + trailing
 * whitespace. Used to compute the full span to hide.
 */
function attributeFullSpan (doc: string, valueFrom: number, valueTo: number): { from: number, to: number } {
  // valueFrom is one past the opening quote. Walk back past `"`, `=`, the name.
  let start = valueFrom - 1 // the opening quote
  // before the quote: walk back past `=` and any whitespace.
  while (start > 0 && doc[start - 1] !== ' ' && doc[start - 1] !== '\t' && doc[start - 1] !== '\n') start--
  // include one leading whitespace if present so we don't leave a stray space.
  if (start > 0 && /\s/.test(doc[start - 1])) start--
  let end = valueTo + 1 // past the closing quote
  while (end < doc.length && (doc[end] === ' ' || doc[end] === '\t')) end++
  return { from: start, to: end }
}

/**
 * Framework-agnostic CM6 ViewPlugin. Each time the document or viewport
 * changes, it rebuilds `Decoration.replace` widgets for every image-upload
 * group detected by `computeImageUploadRanges`. `mountWidget` is a
 * host-provided callback that mounts UI framework code (Vue, React, etc.)
 * into the widget's DOM container and returns an unmount function.
 */
export interface MountWidgetArgs {
  elementPointer: string
  group: ImageUploadGroup
}
export type MountWidget = (container: HTMLElement, args: MountWidgetArgs) => () => void

export interface ImageUploadWidgetsOptions {
  tagDescriptors: Record<string, TagDescriptor>
  mountWidget: MountWidget
}

class ImageUploadWidgetType extends WidgetType {
  private unmount: (() => void) | null = null
  constructor (readonly args: MountWidgetArgs, readonly mount: MountWidget) { super() }

  toDOM (): HTMLElement {
    const el = document.createElement('span')
    el.className = 'markup-image-upload-widget'
    this.unmount = this.mount(el, this.args)
    return el
  }

  destroy (): void {
    this.unmount?.()
    this.unmount = null
  }

  eq (other: WidgetType): boolean {
    if (!(other instanceof ImageUploadWidgetType)) return false
    return other.args.elementPointer === this.args.elementPointer &&
      other.args.group.jsonPath.join('/') === this.args.group.jsonPath.join('/')
  }

  ignoreEvent (): boolean { return true }
}

export function portalMarkupImageUploadWidgets (opts: ImageUploadWidgetsOptions) {
  return ViewPlugin.fromClass(class {
    decorations: DecorationSet
    constructor (view: EditorView) { this.decorations = this.build(view) }
    update (u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged) this.decorations = this.build(u.view)
    }
    build (view: EditorView): DecorationSet {
      const doc = view.state.doc.toString()
      // Parse a fresh source map here: ViewPlugin.update() runs BEFORE
      // updateListeners, so any source map maintained by the editor via
      // EditorView.updateListener would still be stale when we read it.
      const { sourceMap } = deserializeElements(doc)
      const ranges = computeImageUploadRanges(doc, sourceMap, opts.tagDescriptors)
      const builder = new RangeSetBuilder<Decoration>()
      ranges.sort((a, b) => a.from - b.from)
      for (const r of ranges) {
        builder.add(r.from, r.to, Decoration.replace({
          widget: new ImageUploadWidgetType({ elementPointer: r.elementPointer, group: r.group }, opts.mountWidget)
        }))
      }
      return builder.finish()
    }
  }, { decorations: v => v.decorations })
}
```

- [ ] **Step 2: Run the widget test**

Run: `npm run test-unit -- tests/features/markup/image-upload-widgets.unit.spec.ts`
Expected: PASS — all five tests green.

If tests fail on the "two groups on same element" case because `image` and `wideImage` aren't both ordered by serializer in the way expected, inspect the source map with a debug log and adjust the assertion or the contiguity helper, then rerun.

- [ ] **Step 3: Export from the public codemirror index**

Edit `shared/markup/codemirror/index.ts` and add:

```ts
export { portalMarkupImageUploadWidgets, computeImageUploadRanges } from './image-upload-widgets.ts'
export type { ImageUploadRange, ImageUploadWidgetsOptions, MountWidget, MountWidgetArgs } from './image-upload-widgets.ts'
```

- [ ] **Step 4: Type-check and lint**

Run: `npm run check-types && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add shared/markup/codemirror/image-upload-widgets.ts shared/markup/codemirror/index.ts
git commit -m "feat(markup): add image-upload widgets CM6 view plugin"
```

---

## Task 6: Create the Vue widget component

**Files:**
- Create: `ui/src/components/markup-widgets/markup-image-widget.vue`

- [ ] **Step 1: Write the component**

Create `ui/src/components/markup-widgets/markup-image-widget.vue`:

```vue
<template>
  <span class="markup-image-widget">
    <image-upload
      v-if="node && resource"
      :model-value="node.data"
      :label="label"
      :width="group.width"
      :height="group.height"
      :resource="resource"
      hide-details="auto"
      @update:model-value="onChange"
    />
    <span
      v-else
      class="markup-image-widget__placeholder"
    >
      {{ group.label ?? group.jsonPath.join('.') }}
    </span>
  </span>
</template>

<script setup lang="ts">
import type { ImageUploadGroup } from '@data-fair/portals-shared-markup'
import type { StatefulLayout } from '@json-layout/core/state'
import { findNodeByDataPath } from '@data-fair/portals-shared-markup/codemirror'

const props = defineProps<{
  elementPointer: string
  group: ImageUploadGroup
}>()

const statefulLayout = inject<StatefulLayout | null>('markup-stateful-layout', null)
const elementsDataPath = inject<string>('markup-elements-data-path', '')
const resource = inject<{ type: 'page', _id: string } | null>('markup-resource', null)

const targetPath = computed(() =>
  elementsDataPath + props.elementPointer + '/' + props.group.jsonPath.join('/')
)

// Re-resolve on every getter call so a StatefulLayout rebuild (new stateTree)
// is picked up on the next render. `(sl as any).stateTree` is the current
// documented shape — mirror the cast used elsewhere in this file.
const node = computed(() => {
  const treeRoot = (statefulLayout as any)?.stateTree?.root
  if (!treeRoot) return null
  return findNodeByDataPath<any>(treeRoot, targetPath.value)
})

const label = computed(() => props.group.label ?? props.group.jsonPath.join('.'))

function onChange (data: any) {
  if (!statefulLayout || !node.value) return
  statefulLayout.input(node.value, data)
}
</script>

<style scoped>
.markup-image-widget {
  display: inline-flex;
  vertical-align: middle;
  margin: 0 2px;
  max-width: 360px;
}
.markup-image-widget__placeholder {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-style: italic;
}
</style>
```

Notes on imports:
- `image-upload` is auto-imported by Nuxt's Vue auto-import from `ui/src/components/image-upload.vue`.
- `findNodeByDataPath` is re-exported from `@data-fair/portals-shared-markup/codemirror` (see `shared/markup/codemirror/index.ts:11`).
- `ref`, `computed`, `inject` are auto-imported by Nuxt.

- [ ] **Step 2: Type-check**

Run: `npm run check-types`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add ui/src/components/markup-widgets/markup-image-widget.vue
git commit -m "feat(markup): add markup-image-widget Vue component"
```

---

## Task 7: Wire the plugin into the editor component

**Files:**
- Modify: `ui/src/components/page-edit/page-edit-elements-markup.vue`

- [ ] **Step 1: Import new pieces**

Near the other imports in `<script setup lang="ts">` at `ui/src/components/page-edit/page-edit-elements-markup.vue`:

```ts
import { createApp } from 'vue'
import { tagDescriptors } from '@data-fair/portals-shared-markup'
import { portalMarkupImageUploadWidgets } from '@data-fair/portals-shared-markup/codemirror'
import MarkupImageWidget from '~/components/markup-widgets/markup-image-widget.vue'
```

- [ ] **Step 2: Construct a pageRef alongside other editor state**

After the `editorEl` / `hasErrors` refs, add:

```ts
const pageRef = { type: 'page' as const, _id: inject('page-id') as string }
```

- [ ] **Step 3: Add the plugin extension to `buildExtensions`**

Inside `buildExtensions(locale)` at `page-edit-elements-markup.vue`, add to the returned array (after `portalMarkupExtensions(...)`):

```ts
portalMarkupImageUploadWidgets({
  tagDescriptors,
  mountWidget: (container, { elementPointer, group }) => {
    const app = createApp(MarkupImageWidget, { elementPointer, group })
    app.provide('markup-stateful-layout', props.statefulLayout)
    app.provide('markup-elements-data-path', elementsDataPath())
    app.provide('markup-resource', pageRef)
    app.mount(container)
    return () => app.unmount()
  }
})
```

- [ ] **Step 4: Type-check and lint**

Run: `npm run check-types && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add ui/src/components/page-edit/page-edit-elements-markup.vue
git commit -m "feat(markup): mount image-upload widgets in markup editor"
```

---

## Task 8: Smoke test + final verification

**Files:** (none — verification only)

- [ ] **Step 1: Run all related unit tests**

Run: `npm run test-unit -- tests/features/markup/`
Expected: PASS for all markup tests (existing + new).

- [ ] **Step 2: Build the UI**

Run: `npm -w ui run build`
Expected: successful build with no TypeScript errors for the new files.

- [ ] **Step 3: Manual smoke test**

Start-or-check the dev environment as documented in `AGENTS.md`:

```bash
bash dev/status.sh
```

With the UI dev server running, load a page in the browser:

1. Navigate to a page edit config URL: `/pages/<pageId>/edit-config`.
2. Enable markup mode by running in the browser console:

```js
localStorage.setItem('df-markup-edit', '1'); location.reload()
```

3. Add an `<image>` element via form mode, then switch to Markup mode.
4. Expected: the attributes `image._id="…"` / `image.name="…"` / `image.mimeType="…"` are visually replaced by the `v-file-input` widget with a thumbnail preview of the current image.
5. Click the input, pick a different image file. After upload:
   - The CM6 text updates to show the new `_id` / `name` / `mimeType`.
   - Toggling back to Form mode shows the same new image.
6. Add a `<section>` element with a background image (via Form mode), switch to Markup mode, verify the `background.image` group also renders as a widget.
7. Edit the markup text around the widget (e.g. add a `banner="false"` attribute between existing attrs). Verify the widget disappears (interleaved) and reappears after the blur-serialize cycle normalizes attribute order.

- [ ] **Step 4: Final commit if anything was tweaked**

```bash
git status
# If tweaks were needed:
git add -p
git commit -m "fix(markup): address smoke-test findings"
```

---

## Verification checklist

- [ ] `npm run build-types` — `imageUploadGroups` present on `image`, `section` (or equivalent layout container), and at least one list element.
- [ ] `npm run test-unit -- tests/features/markup/` — all new and existing tests pass.
- [ ] `npm run check-types` — clean.
- [ ] `npm run lint` — clean.
- [ ] Manual: widget appears, upload round-trips text, Form mode agrees, interleaved text gracefully falls back to plain attributes.
