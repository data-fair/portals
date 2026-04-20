# Simplify Image-Upload Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the image-upload markup widget's contiguity-based span logic with a single-attribute binding (`_id`) plus CM6 hide decorations for the two auxiliary attributes (`name`, `mimeType`).

**Architecture:** Markup text on disk is unchanged — the serializer still emits all three attributes, the deserializer still reads them, schema/JSON round-trip is untouched. The change is purely in the CodeMirror decoration layer of `shared/markup/codemirror/image-upload-widgets.ts`: instead of computing a contiguous span covering the three attributes and replacing it with one widget, we bind the widget to the `_id` attribute's value range and emit empty-replace decorations for the other two attribute ranges.

**Tech Stack:** TypeScript, CodeMirror 6 (`@codemirror/view` decorations), Playwright (test harness).

---

## Files

- **Modify:** `shared/markup/codemirror/image-upload-widgets.ts` — rewrite `computeImageUploadRanges` and the `ViewPlugin.build` to emit three range kinds (widget, hide, point) instead of a single span-or-point per group. Delete `contiguousGroupSpan` and `REQUIRED_LEAVES`.
- **Modify:** `tests/features/markup/image-upload-widgets.unit.spec.ts` — replace contiguity test cases with single-attribute binding + hide-range cases.
- **Modify:** `tests/features/ui/markup-edit.e2e.spec.ts:172-175` — assertions that read `.cm-content` text will no longer see `image.name` / `image.mimeType` (they're hidden). Switch to asserting against the underlying doc state via `browser_evaluate` on the `EditorView`, or by inspecting the `elements` prop via a data-testid.
- **Modify:** `docs/architecture/markup-editor.md` §8.5 and §11 — describe the new binding rule and remove the "contiguity surprise" caveat.

---

## Task 1: Write failing unit tests for the new widget/hide range behavior

**Files:**
- Modify: `tests/features/markup/image-upload-widgets.unit.spec.ts`

- [ ] **Step 1: Replace the test file contents with the new expectations**

```typescript
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'
import { tagDescriptors } from '../../../shared/markup/tag-descriptors.ts'
import { computeImageUploadRanges } from '../../../shared/markup/codemirror/image-upload-widgets.ts'

test.describe('image-upload widget range computation', () => {
  test('emits a widget range on _id and hide ranges on name/mimeType when all three are present', () => {
    const src = '<image image._id="abc" image.name="photo.jpg" image.mimeType="image/jpeg" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)

    const imageGroup = ranges.filter(r => r.group.jsonPath.join('.') === 'image')
    assert.equal(imageGroup.length, 3, 'one widget + two hides for the image group')

    const widgetRanges = imageGroup.filter(r => r.kind === 'widget')
    const hideRanges = imageGroup.filter(r => r.kind === 'hide')
    assert.equal(widgetRanges.length, 1)
    assert.equal(hideRanges.length, 2)

    const covered = src.slice(widgetRanges[0].from, widgetRanges[0].to)
    assert.ok(covered.includes('image._id'), `widget range should cover the _id attribute, got: ${covered}`)

    const hiddenTexts = hideRanges.map(r => src.slice(r.from, r.to)).sort()
    assert.match(hiddenTexts[0], /image\.mimeType=/)
    assert.match(hiddenTexts[1], /image\.name=/)
  })

  test('tolerates interleaved attributes (no contiguity requirement)', () => {
    const src = '<image image._id="abc" banner="true" image.name="photo.jpg" image.mimeType="image/jpeg" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)

    const imageGroup = ranges.filter(r => r.group.jsonPath.join('.') === 'image')
    assert.equal(imageGroup.length, 3, 'interleaving no longer suppresses the widget')
    assert.equal(imageGroup.filter(r => r.kind === 'widget').length, 1)
    assert.equal(imageGroup.filter(r => r.kind === 'hide').length, 2)

    // banner range is NOT among the hide ranges
    const hideCovered = imageGroup.filter(r => r.kind === 'hide').map(r => src.slice(r.from, r.to)).join('|')
    assert.ok(!hideCovered.includes('banner'))
  })

  test('emits the widget even when only _id is present (partial state, no hides needed)', () => {
    const src = '<image image._id="abc" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    const imageGroup = ranges.filter(r => r.group.jsonPath.join('.') === 'image')
    assert.equal(imageGroup.filter(r => r.kind === 'widget').length, 1)
    assert.equal(imageGroup.filter(r => r.kind === 'hide').length, 0)
  })

  test('hides name/mimeType even when _id is absent but widget is not emitted (avoid showing orphan attrs)', () => {
    // This matches the "partial state where user forgot _id" case. The widget
    // falls back to the point-upload affordance ONLY when the whole group is
    // empty; a partial state shows no widget but still hides the stray attrs.
    const src = '<image image.name="photo.jpg" image.mimeType="image/jpeg" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    const imageGroup = ranges.filter(r => r.group.jsonPath.join('.') === 'image')
    // No widget (no _id), no point widget (group is not bare), but two hide ranges.
    assert.equal(imageGroup.filter(r => r.kind === 'widget').length, 0)
    assert.equal(imageGroup.filter(r => r.kind === 'point').length, 0)
    assert.equal(imageGroup.filter(r => r.kind === 'hide').length, 2)
  })

  test('emits a point widget for each empty image-upload group on a bare tag', () => {
    const src = '<image />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    const points = ranges.filter(r => r.kind === 'point')
    assert.equal(points.length, 2, 'image + wideImage groups each contribute a point widget')
    for (const r of points) {
      assert.equal(r.from, r.to, 'point widgets are zero-width')
    }
    const paths = points.map(r => r.group.jsonPath.join('.')).sort()
    assert.deepEqual(paths, ['image', 'wideImage'])
  })

  test('ignores tags without image-upload groups', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    assert.equal(ranges.length, 0)
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
    const widgetPaths = ranges.filter(r => r.kind === 'widget').map(r => r.group.jsonPath.join('.')).sort()
    assert.deepEqual(widgetPaths, ['image', 'wideImage'])
    assert.equal(ranges.filter(r => r.kind === 'hide').length, 4, '2 groups × 2 hidden leaves')
  })
})
```

- [ ] **Step 2: Run the test file to confirm it fails against the current implementation**

Run: `npm run test -- tests/features/markup/image-upload-widgets.unit.spec.ts`
Expected: tests fail — `ImageUploadRange` has no `kind` field, `computeImageUploadRanges` behavior doesn't match new expectations.

---

## Task 2: Rewrite `image-upload-widgets.ts`

**Files:**
- Modify: `shared/markup/codemirror/image-upload-widgets.ts`

- [ ] **Step 1: Replace the module contents with the new implementation**

```typescript
/**
 * Inline image-upload widgets for the markup editor.
 *
 * For each image-upload group declared on an element's descriptor, we emit
 * up to three CM6 decorations:
 *
 *   - `widget` range covering the `<group>._id` attribute — replaced with an
 *     inline image-upload control.
 *   - `hide` ranges covering `<group>.name` and `<group>.mimeType` attributes
 *     — replaced with empty decorations so the user never sees them.
 *   - A `point` widget at the open-tag's end when the group has no attributes
 *     at all (bare `<image />`) — click-to-upload affordance.
 *
 * Markup text on disk is unchanged: serializer still emits all three
 * attributes and deserializer still reads them. The decoration layer only
 * changes how the attributes render in CM6.
 */
import { Decoration, ViewPlugin, WidgetType, type EditorView, type DecorationSet, type ViewUpdate } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { deserializeElements } from '../deserializer.ts'
import type { ImageUploadGroup, MarkupSourceMap, TagDescriptor } from '../types.ts'

const AUX_LEAVES = ['name', 'mimeType'] as const

export type ImageUploadRange =
  | { kind: 'widget', from: number, to: number, elementPointer: string, group: ImageUploadGroup }
  | { kind: 'hide', from: number, to: number, elementPointer: string, group: ImageUploadGroup }
  | { kind: 'point', from: number, to: number, elementPointer: string, group: ImageUploadGroup }

export function computeImageUploadRanges (
  doc: string,
  sourceMap: MarkupSourceMap | null | undefined,
  tagDescriptors: Record<string, TagDescriptor>
): ImageUploadRange[] {
  const out: ImageUploadRange[] = []
  if (!sourceMap?.byElementPointer || !sourceMap?.byPointer) return out

  for (const [elementPointer, elementRange] of sourceMap.byElementPointer) {
    const tagName = readTagName(doc, elementRange.from)
    if (!tagName) continue
    const descriptor = tagDescriptors[tagName]
    if (!descriptor?.imageUploadGroups?.length) continue

    descriptor.imageUploadGroups.forEach((group, groupIdx) => {
      const basePath = group.jsonPath.join('/')
      const idRange = sourceMap.byPointer.get(`${elementPointer}/${basePath}/_id`)
      const auxRanges = AUX_LEAVES
        .map(leaf => sourceMap.byPointer.get(`${elementPointer}/${basePath}/${leaf}`))
        .filter((r): r is { from: number, to: number } => r != null)

      if (idRange) {
        const widgetSpan = attributeFullSpan(doc, idRange.from, idRange.to)
        out.push({ kind: 'widget', from: widgetSpan.from, to: widgetSpan.to, elementPointer, group })
      }
      for (const r of auxRanges) {
        const hideSpan = attributeFullSpan(doc, r.from, r.to)
        out.push({ kind: 'hide', from: hideSpan.from, to: hideSpan.to, elementPointer, group })
      }

      // Bare-tag fallback: no _id AND no aux attrs → emit a point widget.
      if (!idRange && auxRanges.length === 0) {
        const pos = insideTagEndPosition(doc, elementRange.to, groupIdx)
        if (pos !== null) out.push({ kind: 'point', from: pos, to: pos, elementPointer, group })
      }
    })
  }

  return out
}

/**
 * Pick a character position inside the open-tag syntax just before the closing
 * `/>` (or `>`), shifted by `groupIdx` characters so multiple empty groups on
 * the same element get distinct insertion points the RangeSetBuilder can
 * order. Returns null if the tag is too short for the requested offset.
 */
function insideTagEndPosition (doc: string, openTagEnd: number, groupIdx: number): number | null {
  let pos = openTagEnd - 1
  if (pos < 0 || doc[pos] !== '>') return null
  if (pos > 0 && doc[pos - 1] === '/') pos--
  pos -= groupIdx
  if (pos < 0) return null
  return pos
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
 * to include the attribute name and forwards past the closing quote plus
 * trailing whitespace. Used so the widget/hide decoration covers the whole
 * `name="value"` text and no stray space is left behind.
 */
function attributeFullSpan (doc: string, valueFrom: number, valueTo: number): { from: number, to: number } {
  let start = valueFrom - 1
  while (start > 0 && doc[start - 1] !== ' ' && doc[start - 1] !== '\t' && doc[start - 1] !== '\n') start--
  if (start > 0 && /\s/.test(doc[start - 1])) start--
  let end = valueTo + 1
  while (end < doc.length && (doc[end] === ' ' || doc[end] === '\t')) end++
  return { from: start, to: end }
}

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
      if (u.docChanged) this.decorations = this.build(u.view)
    }

    build (view: EditorView): DecorationSet {
      const doc = view.state.doc.toString()
      const { sourceMap } = deserializeElements(doc)
      const ranges = computeImageUploadRanges(doc, sourceMap, opts.tagDescriptors)
      const builder = new RangeSetBuilder<Decoration>()
      ranges.sort((a, b) => a.from - b.from || (a.kind === 'hide' ? 1 : -1))
      for (const r of ranges) {
        let deco: Decoration
        if (r.kind === 'widget') {
          const widget = new ImageUploadWidgetType({ elementPointer: r.elementPointer, group: r.group }, opts.mountWidget)
          deco = Decoration.replace({ widget })
        } else if (r.kind === 'point') {
          const widget = new ImageUploadWidgetType({ elementPointer: r.elementPointer, group: r.group }, opts.mountWidget)
          deco = Decoration.widget({ widget, side: 1 })
        } else {
          deco = Decoration.replace({})
        }
        builder.add(r.from, r.to, deco)
      }
      return builder.finish()
    }
  }, { decorations: v => v.decorations })
}
```

- [ ] **Step 2: Run the unit tests and confirm they pass**

Run: `npm run test -- tests/features/markup/image-upload-widgets.unit.spec.ts`
Expected: PASS for all 7 tests.

- [ ] **Step 3: Run the full markup test folder to catch regressions**

Run: `npm run test -- tests/features/markup/`
Expected: PASS for every file in the folder (round-trip, serializer, deserializer, etc. are untouched so they keep passing).

- [ ] **Step 4: Commit**

```bash
git add shared/markup/codemirror/image-upload-widgets.ts tests/features/markup/image-upload-widgets.unit.spec.ts
git commit -m "refactor(markup): bind image-upload widget to _id, hide name/mimeType"
```

---

## Task 3: Update the e2e test that checks rendered editor text

**Files:**
- Modify: `tests/features/ui/markup-edit.e2e.spec.ts:172-175`

**Context:** The existing assertions read `.cm-content` textContent to verify the image attributes are rendered in the editor. With the new hide decorations, `image.name` and `image.mimeType` no longer appear in rendered text — they live only in the underlying document state. The assertion needs to switch to reading the `EditorView.state.doc`.

- [ ] **Step 1: Read the current e2e test around line 160-190 to see the full block**

Run: Open `tests/features/ui/markup-edit.e2e.spec.ts` and locate the block containing `expect(editorText).toContain('image._id="img-stub"')`.

- [ ] **Step 2: Replace the three assertions with a doc-state read**

Find:

```typescript
      const editorText = await page.locator('.markup-editor .cm-content').textContent() ?? ''
      expect(editorText).toContain('image._id="img-stub"')
      expect(editorText).toContain('image.name="stub.png"')
      expect(editorText).toContain('image.mimeType="image/png"')
```

Replace with:

```typescript
      // Widget hides name/mimeType in the rendered view. Read the underlying
      // doc via the EditorView so we can assert the full attribute triple is
      // still present in the source and round-trips correctly.
      const docText = await page.evaluate(() => {
        const el = document.querySelector('.markup-editor .cm-editor') as any
        return el?.cmView?.view?.state?.doc?.toString?.() ?? ''
      })
      expect(docText).toContain('image._id="img-stub"')
      expect(docText).toContain('image.name="stub.png"')
      expect(docText).toContain('image.mimeType="image/png"')

      // And verify the hide decorations apply: rendered text should NOT show
      // the auxiliary attrs.
      const renderedText = await page.locator('.markup-editor .cm-content').textContent() ?? ''
      expect(renderedText).toContain('image._id="img-stub"')
      expect(renderedText).not.toContain('image.name="stub.png"')
      expect(renderedText).not.toContain('image.mimeType="image/png"')
```

- [ ] **Step 3: Run the e2e test**

Run: `npm run test -- tests/features/ui/markup-edit.e2e.spec.ts`
Expected: PASS. If the `cmView` accessor path differs in this project's CM6 version, fall back to querying via a more robust attribute — inspect the DOM in a failing run and adjust.

- [ ] **Step 4: Commit**

```bash
git add tests/features/ui/markup-edit.e2e.spec.ts
git commit -m "test(markup): assert image aux attrs hidden in e2e"
```

---

## Task 4: Update architecture doc

**Files:**
- Modify: `docs/architecture/markup-editor.md` §8.5 (image-upload widgets paragraph) and §11 (contiguity trade-off)

- [ ] **Step 1: Replace the image-upload paragraph in §8.5**

Find the paragraph starting with `**\`image-upload-widgets.ts\`.** Inline \`<image-upload>\` rendered in place of`

Replace the whole paragraph with:

```markdown
**`image-upload-widgets.ts`.** Inline `<image-upload>` rendered in place of
the `image._id` attribute. The widget binds to one attribute range (the
`_id` leaf); the two auxiliary attributes `image.name` and `image.mimeType`
are emitted in markup by the serializer and parsed by the deserializer as
usual, but hidden from view via CM6 empty-replace decorations. Ordering is
irrelevant — each leaf has its own decoration. Bare tags (`<image />`) get a
point widget as a click-to-upload affordance. The range computation lives
in `computeImageUploadRanges` — a pure function with its own unit tests.
```

- [ ] **Step 2: Remove the contiguity caveat from §11**

Find the paragraph starting with `**Contiguity logic for image-upload widgets.**` and delete it entirely (including its heading).

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/markup-editor.md
git commit -m "docs(markup): describe _id-binding + hide decorations for image widget"
```

---

## Self-review checklist (done before handoff)

- **Spec coverage:**
  - "Bind widget to `_id`" → Task 2, `kind: 'widget'` on `_id` range.
  - "Hide `name` and `mimeType`" → Task 2, `kind: 'hide'` via `Decoration.replace({})`.
  - "No schema change" → Tasks touch only CM6 layer + tests + doc.
  - Bare-tag upload affordance preserved → Task 2, `kind: 'point'`.
- **Placeholder scan:** no TBDs, no "add error handling", every code step shows the full code.
- **Type consistency:** `ImageUploadRange` is a discriminated union with `kind` used by every consumer; `computeImageUploadRanges` return type matches the widget's `ViewPlugin.build` consumption.

---
