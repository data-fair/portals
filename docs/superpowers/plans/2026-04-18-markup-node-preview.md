# Markup Node Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a togglable per-element preview widget to the page-edit markup editor. A gutter icon next to each element's opening tag toggles a block widget below the element's source, rendering the element via the existing `<page-preview-element>` Vue component.

**Architecture:** New framework-agnostic CM6 module (`shared/markup/codemirror/node-preview-widgets.ts`) exports extensions (a `StateField` for toggle state, a `StateEffect` to flip toggles, a gutter with clickable markers, and a `ViewPlugin` for block widgets). The host (`ui/src/components/page-edit/page-edit-elements-markup.vue`) provides a `mountPreview` callback that pushes entries into an `activeWidgets` teleport list, and mounts a new `<markup-preview-widget>` Vue wrapper that owns its own error boundary around `<page-preview-element>`.

**Tech Stack:** TypeScript, CodeMirror 6 (`@codemirror/view` gutter + `WidgetType`, `@codemirror/state` `StateField`/`StateEffect`), Vue 3 + `<teleport>`, Playwright for unit and e2e tests.

**Spec:** `docs/superpowers/specs/2026-04-18-markup-node-preview-design.md`

---

## File Structure

**Created:**
- `shared/markup/codemirror/node-preview-widgets.ts` — CM6 extensions: toggle state, gutter markers, widget decorations, and the `computeNodePreviewRanges` pure helper
- `ui/src/components/markup-widgets/markup-preview-widget.vue` — Vue wrapper around `<page-preview-element>` with per-widget error boundary
- `tests/features/markup/node-preview-widgets.unit.spec.ts` — pure helper tests
- `tests/features/markup/find-element-by-pointer.unit.spec.ts` — walker helper tests
- `tests/features/markup/node-preview-integration.unit.spec.ts` — CM6 state/plugin integration tests in jsdom

**Modified:**
- `shared/markup/walker.ts` — add `findElementByPointer` pure helper
- `shared/markup/index.ts` — re-export `findElementByPointer`
- `shared/markup/codemirror/index.ts` — re-export `portalMarkupNodePreviewWidgets`, `computeNodePreviewRanges`, and their types
- `ui/src/components/page-edit/page-edit-elements-markup.vue` — discriminated `activeWidgets`, `draftElements`, `mountPreview`, teleport for preview entries
- `tests/features/ui/markup-edit.e2e.spec.ts` — add one toggle/untoggle e2e test

---

## Task 1: Add `findElementByPointer` walker helper

**Files:**
- Test: `tests/features/markup/find-element-by-pointer.unit.spec.ts`
- Modify: `shared/markup/walker.ts`
- Modify: `shared/markup/index.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/features/markup/find-element-by-pointer.unit.spec.ts`:

```ts
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { findElementByPointer } from '../../../shared/markup/walker.ts'

const tree = [
  { type: 'title', titleSize: 'h2', content: 'a' },
  {
    type: 'card',
    children: [
      { type: 'text', content: 'inner' },
      {
        type: 'tabs',
        tabs: [
          { title: 't1', children: [{ type: 'text', content: 'deep' }] }
        ]
      }
    ]
  }
]

test.describe('findElementByPointer', () => {
  test('resolves a top-level pointer', () => {
    const el = findElementByPointer(tree, '/0')
    assert.ok(el)
    assert.equal(el!.type, 'title')
  })

  test('resolves a pointer into a direct children slot', () => {
    const el = findElementByPointer(tree, '/1/children/0')
    assert.ok(el)
    assert.equal(el!.type, 'text')
    assert.equal((el as any).content, 'inner')
  })

  test('resolves a pointer into a structured slot', () => {
    const el = findElementByPointer(tree, '/1/children/1/tabs/0/children/0')
    assert.ok(el)
    assert.equal(el!.type, 'text')
    assert.equal((el as any).content, 'deep')
  })

  test('returns undefined for an out-of-range index', () => {
    assert.equal(findElementByPointer(tree, '/99'), undefined)
    assert.equal(findElementByPointer(tree, '/1/children/9'), undefined)
  })

  test('returns undefined for an empty or malformed pointer', () => {
    assert.equal(findElementByPointer(tree, ''), undefined)
    assert.equal(findElementByPointer(tree, '/'), undefined)
    assert.equal(findElementByPointer(tree, '/abc'), undefined)
  })

  test('returns undefined when traversing through a missing property', () => {
    assert.equal(findElementByPointer(tree, '/0/children/0'), undefined)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- tests/features/markup/find-element-by-pointer.unit.spec.ts`
Expected: all tests fail with "findElementByPointer is not a function" (import resolves, symbol missing).

- [ ] **Step 3: Implement `findElementByPointer` in `shared/markup/walker.ts`**

Append to the end of `shared/markup/walker.ts`:

```ts
/**
 * Resolve a JSON pointer (relative to the elements-array root, e.g.
 * `/1/children/0`) to a page element. Numeric segments index into arrays;
 * string segments index into objects. Returns undefined for malformed
 * pointers, out-of-range indices, or any step that doesn't match the tree
 * shape.
 *
 * Tolerant by design: used by the markup preview widget which may race
 * against transient document states. Callers fall back to a "element
 * unavailable" placeholder on undefined.
 */
export function findElementByPointer (
  elements: unknown,
  pointer: string
): Record<string, any> | undefined {
  if (typeof pointer !== 'string' || pointer === '' || pointer === '/') return undefined
  if (!pointer.startsWith('/')) return undefined
  const segments = pointer.slice(1).split('/')
  let current: any = elements
  for (const seg of segments) {
    if (current == null) return undefined
    if (Array.isArray(current)) {
      const idx = Number(seg)
      if (!Number.isInteger(idx) || idx < 0 || idx >= current.length) return undefined
      current = current[idx]
    } else if (typeof current === 'object') {
      if (!(seg in current)) return undefined
      current = current[seg]
    } else {
      return undefined
    }
  }
  if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined
  return current as Record<string, any>
}
```

- [ ] **Step 4: Re-export from `shared/markup/index.ts`**

Open `shared/markup/index.ts`. Find the existing `export { walkElements } from './walker.ts'` (or equivalent line) and extend it:

```ts
export { walkElements, findElementByPointer } from './walker.ts'
```

If `walker.ts` is not re-exported yet, add a new line.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test -- tests/features/markup/find-element-by-pointer.unit.spec.ts`
Expected: all 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add shared/markup/walker.ts shared/markup/index.ts \
  tests/features/markup/find-element-by-pointer.unit.spec.ts
git commit -m "feat(markup): add findElementByPointer walker helper"
```

---

## Task 2: Add `computeNodePreviewRanges` pure helper

**Files:**
- Create: `shared/markup/codemirror/node-preview-widgets.ts`
- Test: `tests/features/markup/node-preview-widgets.unit.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/features/markup/node-preview-widgets.unit.spec.ts`:

```ts
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'
import { computeNodePreviewRanges } from '../../../shared/markup/codemirror/node-preview-widgets.ts'

test.describe('computeNodePreviewRanges', () => {
  test('returns no ranges when the toggle set is empty', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(src, sourceMap, new Set())
    assert.equal(ranges.length, 0)
  })

  test('returns a range at the element end for a toggled top-level element', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(src, sourceMap, new Set(['/0']))
    assert.equal(ranges.length, 1)
    assert.equal(ranges[0].elementPointer, '/0')
    const expected = sourceMap.byElementPointer.get('/0')!
    assert.equal(ranges[0].from, expected.to)
    assert.equal(ranges[0].to, expected.to)
  })

  test('supports self-closing tags', () => {
    const src = '<divider />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(src, sourceMap, new Set(['/0']))
    assert.equal(ranges.length, 1)
    const expected = sourceMap.byElementPointer.get('/0')!
    assert.equal(ranges[0].from, expected.to)
  })

  test('supports nested elements inside a container', () => {
    const src = [
      '<card>',
      '  <text>inner</text>',
      '</card>'
    ].join('\n')
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(src, sourceMap, new Set(['/0/children/0']))
    assert.equal(ranges.length, 1)
    assert.equal(ranges[0].elementPointer, '/0/children/0')
    const expected = sourceMap.byElementPointer.get('/0/children/0')!
    assert.equal(ranges[0].from, expected.to)
  })

  test('omits ranges for pointers missing from the source map', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(src, sourceMap, new Set(['/0', '/99']))
    assert.equal(ranges.length, 1)
    assert.equal(ranges[0].elementPointer, '/0')
  })

  test('returns ranges sorted by from offset', () => {
    const src = [
      '<title titleSize="h2">A</title>',
      '<text>B</text>',
      '<divider />'
    ].join('\n')
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(src, sourceMap, new Set(['/2', '/0', '/1']))
    assert.equal(ranges.length, 3)
    assert.ok(ranges[0].from <= ranges[1].from)
    assert.ok(ranges[1].from <= ranges[2].from)
    assert.deepEqual(ranges.map(r => r.elementPointer), ['/0', '/1', '/2'])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- tests/features/markup/node-preview-widgets.unit.spec.ts`
Expected: all tests fail with module-not-found error for `node-preview-widgets.ts`.

- [ ] **Step 3: Create the module with just the helper**

Create `shared/markup/codemirror/node-preview-widgets.ts`:

```ts
import type { MarkupSourceMap } from '../types.ts'

/**
 * Pure helper: given the current document, its source map, and the set of
 * pointers the user has toggled "preview on", return the CM6 ranges where a
 * block widget should render. Each range is a zero-width point at the end
 * offset of the toggled element (`byElementPointer[pointer].to`). Ordered by
 * `from` so RangeSetBuilder accepts them in sequence.
 */
export interface NodePreviewRange {
  from: number
  to: number
  elementPointer: string
}

export function computeNodePreviewRanges (
  _doc: string,
  sourceMap: MarkupSourceMap | null | undefined,
  toggled: ReadonlySet<string>
): NodePreviewRange[] {
  const out: NodePreviewRange[] = []
  if (!sourceMap?.byElementPointer || toggled.size === 0) return out
  for (const pointer of toggled) {
    const range = sourceMap.byElementPointer.get(pointer)
    if (!range) continue
    out.push({ from: range.to, to: range.to, elementPointer: pointer })
  }
  out.sort((a, b) => a.from - b.from)
  return out
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test -- tests/features/markup/node-preview-widgets.unit.spec.ts`
Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add shared/markup/codemirror/node-preview-widgets.ts \
  tests/features/markup/node-preview-widgets.unit.spec.ts
git commit -m "feat(markup): add computeNodePreviewRanges pure helper"
```

---

## Task 3: Toggle state field & effect

**Files:**
- Modify: `shared/markup/codemirror/node-preview-widgets.ts`
- Test: `tests/features/markup/node-preview-integration.unit.spec.ts`

- [ ] **Step 1: Write the failing integration test**

Create `tests/features/markup/node-preview-integration.unit.spec.ts`:

```ts
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { JSDOM } from 'jsdom'
import {
  portalMarkupNodePreviewWidgets,
  toggleNodePreview,
  nodePreviewState
} from '../../../shared/markup/codemirror/node-preview-widgets.ts'

function withDom (fn: () => void) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>')
  const globalAny = globalThis as any
  const prev = {
    window: globalAny.window,
    document: globalAny.document,
    HTMLElement: globalAny.HTMLElement,
    Node: globalAny.Node
  }
  globalAny.window = dom.window
  globalAny.document = dom.window.document
  globalAny.HTMLElement = dom.window.HTMLElement
  globalAny.Node = dom.window.Node
  try {
    fn()
  } finally {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete globalAny[k]
      else globalAny[k] = v
    }
  }
}

test.describe('node-preview state field', () => {
  test('starts empty, toggling adds pointer, toggling again removes it', () => {
    withDom(() => {
      const parent = document.body
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">Hi</title>',
          extensions: portalMarkupNodePreviewWidgets({ mountPreview: () => () => {} })
        }),
        parent
      })
      try {
        assert.equal(view.state.field(nodePreviewState).size, 0)
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(view.state.field(nodePreviewState).size, 1)
        assert.ok(view.state.field(nodePreviewState).has('/0'))
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(view.state.field(nodePreviewState).size, 0)
      } finally {
        view.destroy()
      }
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- tests/features/markup/node-preview-integration.unit.spec.ts`
Expected: fails with "portalMarkupNodePreviewWidgets is not defined" or module export error.

- [ ] **Step 3: Add `jsdom` to dev dependencies if not already present**

Check `package.json`:

```bash
grep -n '"jsdom"' package.json
```

If jsdom is absent at the repo root, add it to `devDependencies` with a recent version (`^24.1.0`) via `npm install -D jsdom`. If it's already there, skip this step.

- [ ] **Step 4: Implement the state field and effect**

Edit `shared/markup/codemirror/node-preview-widgets.ts` — add above the existing helper:

```ts
import { StateEffect, StateField, type Extension } from '@codemirror/state'
```

And add these definitions after the existing `computeNodePreviewRanges` function:

```ts
/**
 * Dispatch to flip the preview state of a single element pointer. The field
 * reducer adds the pointer if absent, removes it if present, so repeated
 * dispatches toggle on/off.
 */
export const toggleNodePreview = StateEffect.define<{ elementPointer: string }>()

/**
 * Holds the set of element pointers currently showing a preview widget.
 * Driven by `toggleNodePreview` effects. The `ViewPlugin` and gutter marker
 * both read this field to decide what to render.
 */
export const nodePreviewState = StateField.define<Set<string>>({
  create: () => new Set<string>(),
  update (value, tr) {
    let next: Set<string> | null = null
    for (const effect of tr.effects) {
      if (!effect.is(toggleNodePreview)) continue
      if (!next) next = new Set(value)
      const pointer = effect.value.elementPointer
      if (next.has(pointer)) next.delete(pointer)
      else next.add(pointer)
    }
    return next ?? value
  }
})

/**
 * Host-provided mount callback: CM6 hands us a DOM container and the target
 * element pointer; the host mounts its UI (Vue, React, etc.) into the
 * container and returns an unmount function that CM6 will call when the
 * widget is destroyed.
 */
export interface MountPreviewArgs { elementPointer: string }
export type MountPreview = (container: HTMLElement, args: MountPreviewArgs) => () => void
export interface NodePreviewWidgetsOptions { mountPreview: MountPreview }

/**
 * Bundle extension. Step 3 exports only the state plumbing; the gutter and
 * ViewPlugin are added by later tasks. Returning an array of `Extension`
 * from day one keeps the public shape stable.
 */
export function portalMarkupNodePreviewWidgets (
  _opts: NodePreviewWidgetsOptions
): Extension[] {
  return [nodePreviewState]
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- tests/features/markup/node-preview-integration.unit.spec.ts`
Expected: the state-field test passes.

- [ ] **Step 6: Commit**

```bash
git add shared/markup/codemirror/node-preview-widgets.ts \
  tests/features/markup/node-preview-integration.unit.spec.ts \
  package.json package-lock.json
git commit -m "feat(markup): add node-preview toggle state field and effect"
```

---

## Task 4: Widget decorations via ViewPlugin

**Files:**
- Modify: `shared/markup/codemirror/node-preview-widgets.ts`
- Modify: `tests/features/markup/node-preview-integration.unit.spec.ts`

- [ ] **Step 1: Add the failing integration tests**

Append to `tests/features/markup/node-preview-integration.unit.spec.ts`:

```ts
import { deserializeElements } from '../../../shared/markup/deserializer.ts'

interface MountCall { container: HTMLElement, elementPointer: string, unmount: () => void }

function countPreviewWidgets (view: EditorView): number {
  return view.dom.querySelectorAll('.markup-node-preview-widget').length
}

test.describe('node-preview widget plugin', () => {
  test('mounts a preview widget when the pointer is toggled on, unmounts on toggle off', () => {
    withDom(() => {
      const mounts: MountCall[] = []
      const unmounts: string[] = []
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">Hi</title>',
          extensions: portalMarkupNodePreviewWidgets({
            mountPreview: (container, { elementPointer }) => {
              const unmount = () => { unmounts.push(elementPointer) }
              mounts.push({ container, elementPointer, unmount })
              return unmount
            }
          })
        }),
        parent: document.body
      })
      try {
        assert.equal(countPreviewWidgets(view), 0)
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(mounts.length, 1)
        assert.equal(mounts[0].elementPointer, '/0')
        assert.equal(countPreviewWidgets(view), 1)
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(unmounts.length, 1)
        assert.equal(countPreviewWidgets(view), 0)
      } finally {
        view.destroy()
      }
    })
  })

  test('preserves the mounted widget when an unrelated edit shifts the element offset', () => {
    withDom(() => {
      let mountCount = 0
      let unmountCount = 0
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">Hi</title>',
          extensions: portalMarkupNodePreviewWidgets({
            mountPreview: () => { mountCount++; return () => { unmountCount++ } }
          })
        }),
        parent: document.body
      })
      try {
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(mountCount, 1)
        // Prepend whitespace, shifting every offset — the widget should
        // relocate via `eq()` matching without re-mounting.
        view.dispatch({ changes: { from: 0, insert: '\n' } })
        assert.equal(mountCount, 1, 'mount must not be called again')
        assert.equal(unmountCount, 0, 'unmount must not fire')
      } finally {
        view.destroy()
      }
    })
  })

  test('unmounts the widget when the toggled element is removed from the document', () => {
    withDom(() => {
      let unmountCount = 0
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">Hi</title>',
          extensions: portalMarkupNodePreviewWidgets({
            mountPreview: () => () => { unmountCount++ }
          })
        }),
        parent: document.body
      })
      try {
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(countPreviewWidgets(view), 1)
        // Delete the entire element text.
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: '' } })
        assert.equal(unmountCount, 1)
        assert.equal(countPreviewWidgets(view), 0)
      } finally {
        view.destroy()
      }
    })
  })

  test('keeps existing widgets visible during a transient parse failure', () => {
    withDom(() => {
      let unmountCount = 0
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">Hi</title>',
          extensions: portalMarkupNodePreviewWidgets({
            mountPreview: () => () => { unmountCount++ }
          })
        }),
        parent: document.body
      })
      try {
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(countPreviewWidgets(view), 1)
        // Break parsing briefly: open a tag without closing it.
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: '<title titleSize=' }
        })
        // Sanity: deserializer now reports errors / no element pointers.
        const sm = deserializeElements(view.state.doc.toString()).sourceMap
        assert.equal(sm.byElementPointer.size, 0)
        // The widget must still be in the DOM and must not have unmounted.
        assert.equal(countPreviewWidgets(view), 1)
        assert.equal(unmountCount, 0)
      } finally {
        view.destroy()
      }
    })
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- tests/features/markup/node-preview-integration.unit.spec.ts`
Expected: the four new tests fail (no `.markup-node-preview-widget` elements appear because the ViewPlugin doesn't exist yet).

- [ ] **Step 3: Implement the ViewPlugin and widget type**

Edit `shared/markup/codemirror/node-preview-widgets.ts` — add at the top of the file (next to the existing import):

```ts
import { RangeSetBuilder, StateEffect, StateField, type Extension } from '@codemirror/state'
import {
  Decoration, EditorView, ViewPlugin, WidgetType,
  type DecorationSet, type ViewUpdate
} from '@codemirror/view'
import { deserializeElements } from '../deserializer.ts'
```

(Replace the existing `StateEffect, StateField, type Extension` import if already present — consolidate into a single import line.)

Below the existing `NodePreviewWidgetsOptions` interface, add:

```ts
class NodePreviewWidgetType extends WidgetType {
  private unmount: (() => void) | null = null
  constructor (
    readonly elementPointer: string,
    readonly mount: MountPreview
  ) { super() }

  toDOM (): HTMLElement {
    const el = document.createElement('div')
    el.className = 'markup-node-preview-widget'
    el.setAttribute('data-markup-preview-pointer', this.elementPointer)
    this.unmount = this.mount(el, { elementPointer: this.elementPointer })
    return el
  }

  destroy (): void {
    this.unmount?.()
    this.unmount = null
  }

  eq (other: WidgetType): boolean {
    return other instanceof NodePreviewWidgetType &&
      other.elementPointer === this.elementPointer
  }

  get estimatedHeight (): number { return 80 }
  ignoreEvent (): boolean { return false }
}

function buildDecorations (
  view: EditorView,
  toggled: ReadonlySet<string>,
  mount: MountPreview
): DecorationSet {
  const doc = view.state.doc.toString()
  // Parse inline: ViewPlugin.update runs before updateListener, so any
  // externally-maintained source map is still stale here.
  const { sourceMap } = deserializeElements(doc)
  const ranges = computeNodePreviewRanges(doc, sourceMap, toggled)
  // If the document failed to parse (no element pointers) but the user has
  // toggles on, keep the *previous* decoration set — handled by the caller
  // returning early on the empty-sourceMap case.
  if (sourceMap.byElementPointer.size === 0 && toggled.size > 0) {
    return null as any // sentinel: caller preserves previous decorations
  }
  const builder = new RangeSetBuilder<Decoration>()
  for (const r of ranges) {
    builder.add(r.from, r.to, Decoration.widget({
      widget: new NodePreviewWidgetType(r.elementPointer, mount),
      block: true,
      side: 1
    }))
  }
  return builder.finish()
}

function nodePreviewWidgetsPlugin (mount: MountPreview) {
  return ViewPlugin.fromClass(class {
    decorations: DecorationSet
    constructor (view: EditorView) {
      const built = buildDecorations(view, view.state.field(nodePreviewState), mount)
      this.decorations = built ?? Decoration.none
    }

    update (u: ViewUpdate) {
      const toggled = u.state.field(nodePreviewState)
      const toggleChanged = u.startState.field(nodePreviewState) !== toggled
      if (!u.docChanged && !toggleChanged) return
      const built = buildDecorations(u.view, toggled, mount)
      // Sentinel: keep previous decorations on transient parse failure.
      if (built === null) return
      this.decorations = built
    }
  }, { decorations: v => v.decorations })
}
```

Then update `portalMarkupNodePreviewWidgets` to include the plugin:

```ts
export function portalMarkupNodePreviewWidgets (
  opts: NodePreviewWidgetsOptions
): Extension[] {
  return [
    nodePreviewState,
    nodePreviewWidgetsPlugin(opts.mountPreview)
  ]
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test -- tests/features/markup/node-preview-integration.unit.spec.ts`
Expected: all five integration tests pass, including the "preserves" and "transient parse failure" cases.

- [ ] **Step 5: Commit**

```bash
git add shared/markup/codemirror/node-preview-widgets.ts \
  tests/features/markup/node-preview-integration.unit.spec.ts
git commit -m "feat(markup): render block widgets for toggled preview pointers"
```

---

## Task 5: Gutter with clickable toggle markers

**Files:**
- Modify: `shared/markup/codemirror/node-preview-widgets.ts`
- Modify: `tests/features/markup/node-preview-integration.unit.spec.ts`

- [ ] **Step 1: Add the failing gutter tests**

Append to `tests/features/markup/node-preview-integration.unit.spec.ts`:

```ts
test.describe('node-preview gutter', () => {
  test('renders one gutter marker per element open-tag line', () => {
    withDom(() => {
      const view = new EditorView({
        state: EditorState.create({
          doc: [
            '<title titleSize="h2">A</title>',
            '<text>B</text>',
            '<divider />'
          ].join('\n'),
          extensions: portalMarkupNodePreviewWidgets({ mountPreview: () => () => {} })
        }),
        parent: document.body
      })
      try {
        const markers = view.dom.querySelectorAll('.cm-gutter-node-preview button')
        assert.equal(markers.length, 3)
      } finally {
        view.destroy()
      }
    })
  })

  test('clicking a gutter marker dispatches toggleNodePreview for that pointer', () => {
    withDom(() => {
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">A</title>\n<text>B</text>',
          extensions: portalMarkupNodePreviewWidgets({ mountPreview: () => () => {} })
        }),
        parent: document.body
      })
      try {
        const markers = Array.from(
          view.dom.querySelectorAll('.cm-gutter-node-preview button')
        ) as HTMLButtonElement[]
        assert.equal(markers.length, 2)
        // Expect markers to carry the element pointer they're bound to.
        assert.equal(markers[0].getAttribute('data-markup-preview-pointer'), '/0')
        assert.equal(markers[1].getAttribute('data-markup-preview-pointer'), '/1')
        markers[1].dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }))
        const toggled = view.state.field(nodePreviewState)
        assert.ok(toggled.has('/1'))
        assert.ok(!toggled.has('/0'))
      } finally {
        view.destroy()
      }
    })
  })

  test('marker reflects the toggled-on state via a CSS class', () => {
    withDom(() => {
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">A</title>',
          extensions: portalMarkupNodePreviewWidgets({ mountPreview: () => () => {} })
        }),
        parent: document.body
      })
      try {
        const before = view.dom.querySelector('.cm-gutter-node-preview button')!
        assert.ok(!before.classList.contains('cm-gutter-node-preview-on'))
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        const after = view.dom.querySelector('.cm-gutter-node-preview button')!
        assert.ok(after.classList.contains('cm-gutter-node-preview-on'))
      } finally {
        view.destroy()
      }
    })
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- tests/features/markup/node-preview-integration.unit.spec.ts`
Expected: the three gutter tests fail (no `.cm-gutter-node-preview` nodes in the DOM).

- [ ] **Step 3: Implement the gutter extension**

Edit `shared/markup/codemirror/node-preview-widgets.ts`. Extend the existing `@codemirror/view` import to include `gutter` and `GutterMarker` (they should end up on the same import line):

```ts
import {
  Decoration, EditorView, ViewPlugin, WidgetType, gutter, GutterMarker,
  type DecorationSet, type ViewUpdate
} from '@codemirror/view'
```

Add these definitions after `nodePreviewWidgetsPlugin`:

```ts
class NodePreviewGutterMarker extends GutterMarker {
  constructor (readonly elementPointer: string, readonly isOn: boolean) { super() }

  toDOM (): HTMLElement {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'cm-gutter-node-preview-btn' + (this.isOn ? ' cm-gutter-node-preview-on' : '')
    btn.setAttribute('data-markup-preview-pointer', this.elementPointer)
    btn.setAttribute('aria-label', this.isOn ? 'Hide preview' : 'Show preview')
    btn.setAttribute('aria-pressed', this.isOn ? 'true' : 'false')
    // A simple eye-style glyph; real icon styling lives in the host CSS.
    btn.textContent = this.isOn ? '\u25CF' : '\u25CB'
    btn.addEventListener('mousedown', (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      const view = EditorView.findFromDOM(btn)
      view?.dispatch({ effects: toggleNodePreview.of({ elementPointer: this.elementPointer }) })
    })
    return btn
  }

  eq (other: GutterMarker): boolean {
    return other instanceof NodePreviewGutterMarker &&
      other.elementPointer === this.elementPointer &&
      other.isOn === this.isOn
  }
}

function buildGutterMarkers (view: EditorView): ReturnType<RangeSetBuilder<GutterMarker>['finish']> {
  const doc = view.state.doc.toString()
  const { sourceMap } = deserializeElements(doc)
  const toggled = view.state.field(nodePreviewState)
  // One marker per element, anchored at the line containing the element's
  // opening tag. Dedupe by line number so multiple elements on the same line
  // (rare post-serialize) only emit one marker — the first one wins.
  const perLine = new Map<number, { pos: number, pointer: string }>()
  for (const [pointer, range] of sourceMap.byElementPointer) {
    const line = view.state.doc.lineAt(range.from)
    if (!perLine.has(line.number)) {
      perLine.set(line.number, { pos: line.from, pointer })
    }
  }
  const builder = new RangeSetBuilder<GutterMarker>()
  for (const { pos, pointer } of [...perLine.values()].sort((a, b) => a.pos - b.pos)) {
    builder.add(pos, pos, new NodePreviewGutterMarker(pointer, toggled.has(pointer)))
  }
  return builder.finish()
}

function nodePreviewGutterExtension () {
  return gutter({
    class: 'cm-gutter-node-preview',
    markers: (view) => buildGutterMarkers(view),
    lineMarkerChange: (u) =>
      u.docChanged || u.startState.field(nodePreviewState) !== u.state.field(nodePreviewState),
    initialSpacer: () => new NodePreviewGutterMarker('', false)
  })
}
```

Update `portalMarkupNodePreviewWidgets` to include the gutter:

```ts
export function portalMarkupNodePreviewWidgets (
  opts: NodePreviewWidgetsOptions
): Extension[] {
  return [
    nodePreviewState,
    nodePreviewWidgetsPlugin(opts.mountPreview),
    nodePreviewGutterExtension()
  ]
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test -- tests/features/markup/node-preview-integration.unit.spec.ts`
Expected: all integration tests pass (5 from Task 4 + 3 new = 8).

- [ ] **Step 5: Commit**

```bash
git add shared/markup/codemirror/node-preview-widgets.ts \
  tests/features/markup/node-preview-integration.unit.spec.ts
git commit -m "feat(markup): add gutter with clickable node-preview toggle markers"
```

---

## Task 6: Re-export from the codemirror barrel

**Files:**
- Modify: `shared/markup/codemirror/index.ts`

- [ ] **Step 1: Add the re-exports**

Open `shared/markup/codemirror/index.ts`. After the existing `portalMarkupImageUploadWidgets` re-export block, append:

```ts
export {
  portalMarkupNodePreviewWidgets,
  computeNodePreviewRanges,
  toggleNodePreview,
  nodePreviewState
} from './node-preview-widgets.ts'
export type {
  NodePreviewRange,
  NodePreviewWidgetsOptions,
  MountPreview,
  MountPreviewArgs
} from './node-preview-widgets.ts'
```

- [ ] **Step 2: Verify types compile**

Run: `npm run check-types`
Expected: clean exit (no new type errors).

- [ ] **Step 3: Commit**

```bash
git add shared/markup/codemirror/index.ts
git commit -m "feat(markup): export node-preview widget extension from codemirror barrel"
```

---

## Task 7: Vue wrapper component with error boundary

**Files:**
- Create: `ui/src/components/markup-widgets/markup-preview-widget.vue`

- [ ] **Step 1: Create the wrapper component**

Create `ui/src/components/markup-widgets/markup-preview-widget.vue`:

```vue
<template>
  <div class="markup-preview-widget-frame">
    <div v-if="failed" class="markup-preview-widget-error">
      {{ t('previewFailed') }}
    </div>
    <div v-else-if="!element" class="markup-preview-widget-missing">
      {{ t('elementUnavailable') }}
    </div>
    <page-preview-element
      v-else
      :key="elementPointer"
      :model-value="element"
      :context="context"
      :pages="pages"
    />
  </div>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'
import { onErrorCaptured } from 'vue'

const props = defineProps<{
  elementPointer: string
  element: PageElement | undefined
  pages: unknown
}>()

const { t } = useI18n()

const context = computed(() => ({ isRoot: false, index: 0, parentLength: 1 }))

const failed = ref(false)
onErrorCaptured((err) => {
  failed.value = true
  // eslint-disable-next-line no-console
  console.error('[markup-preview-widget] render failed for', props.elementPointer, err)
  return false
})
</script>

<i18n lang="yaml">
en:
  previewFailed: Preview failed to render
  elementUnavailable: Element unavailable
fr:
  previewFailed: Échec du rendu de l'aperçu
  elementUnavailable: Élément indisponible
</i18n>

<style scoped>
.markup-preview-widget-frame {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.24);
  border-radius: 4px;
  margin: 4px 0;
  padding: 8px;
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.markup-preview-widget-error,
.markup-preview-widget-missing {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-style: italic;
  font-size: 0.875rem;
}
</style>
```

- [ ] **Step 2: Verify types compile**

Run: `npm run check-types`
Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
git add ui/src/components/markup-widgets/markup-preview-widget.vue
git commit -m "feat(markup): add markup-preview-widget wrapper with error boundary"
```

---

## Task 8: Wire the preview extension into the markup editor

**Files:**
- Modify: `ui/src/components/page-edit/page-edit-elements-markup.vue`

- [ ] **Step 1: Extend `ActiveWidget` into a discriminated union**

Open `ui/src/components/page-edit/page-edit-elements-markup.vue`. Replace the `ActiveWidget` interface block (currently around lines 69-75) with:

```ts
type ActiveWidget =
  | { kind: 'image', key: string, host: HTMLElement, elementPointer: string, group: ImageUploadGroup }
  | { kind: 'preview', key: string, host: HTMLElement, elementPointer: string }
```

- [ ] **Step 2: Update the image-widget push site**

Find the `mountWidget` option in the `portalMarkupImageUploadWidgets({...})` call and change the push to include the discriminator:

```ts
mountWidget: (container, { elementPointer, group }) => {
  const key = `image:${elementPointer}:${group.jsonPath.join('/')}:${widgetSeq++}`
  activeWidgets.value = [...activeWidgets.value, { kind: 'image', key, host: container, elementPointer, group }]
  return () => {
    activeWidgets.value = activeWidgets.value.filter(w => w.key !== key)
  }
}
```

- [ ] **Step 3: Add `draftElements` and a `draftByPointer` helper**

Add these near the `lastExternalText`/`lastSourceMap` declarations:

```ts
import { findElementByPointer } from '@data-fair/portals-shared-markup'

const draftElements = shallowRef<PageElement[] | null>(null)
```

In `buildExtensions`, in the existing `EditorView.updateListener.of((update) => { ... })` callback, extend it to populate `draftElements` on successful deserialize:

```ts
EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    const parsed = deserializeElements(update.state.doc.toString())
    lastSourceMap = parsed.sourceMap
    if (parsed.elements != null && parsed.errors.length === 0) {
      draftElements.value = parsed.elements as PageElement[]
    }
    // On parse failure: leave draftElements at its last-good snapshot so
    // previews stay visible.
  }
  if (!update.docChanged && !update.transactions.some(tr => tr.effects.length)) return
  let count = 0
  forEachDiagnostic(update.state, () => { count++ })
  hasErrors.value = count > 0
}),
```

In `applyChange`, after `elements.value = result.elements as PageElement[]`, add:

```ts
draftElements.value = null
```

- [ ] **Step 4: Import and register the preview extension**

Update the import from the codemirror barrel near the top of the `<script setup>`:

```ts
import {
  portalMarkupExtensions,
  portalMarkupImageUploadWidgets,
  portalMarkupNodePreviewWidgets,
  setMarkupExternalDiagnostics,
  collectErrorsByDataPath,
  findNodeByDataPath,
  offsetToElementPointer,
  toCmDiagnostic,
  type AttributeValueContext
} from '@data-fair/portals-shared-markup/codemirror'
```

In `buildExtensions`, add after the `portalMarkupImageUploadWidgets({...})` entry:

```ts
portalMarkupNodePreviewWidgets({
  mountPreview: (container, { elementPointer }) => {
    const key = `preview:${elementPointer}:${widgetSeq++}`
    activeWidgets.value = [...activeWidgets.value, { kind: 'preview', key, host: container, elementPointer }]
    return () => {
      activeWidgets.value = activeWidgets.value.filter(w => w.key !== key)
    }
  }
}),
```

- [ ] **Step 5: Add the preview teleport block and import the wrapper**

At the top of `<script setup>`, add:

```ts
import MarkupPreviewWidget from '~/components/markup-widgets/markup-preview-widget.vue'
```

In the `<template>`, after the existing `<teleport v-for="w in activeWidgets">` for images, add a second block. Split the list by kind to keep the template readable — replace the single loop with:

```vue
<teleport
  v-for="w in imageWidgets"
  :key="w.key"
  :to="w.host"
>
  <markup-image-widget
    :element-pointer="w.elementPointer"
    :group="w.group"
    :elements-node="node ?? null"
    :stateful-layout="statefulLayout ?? null"
    :resource="pageRef"
  />
</teleport>
<teleport
  v-for="w in previewWidgets"
  :key="w.key"
  :to="w.host"
>
  <markup-preview-widget
    :element-pointer="w.elementPointer"
    :element="resolvePreviewElement(w.elementPointer)"
    :pages="null"
  />
</teleport>
```

Add the split computeds near the bottom of `<script setup>`:

```ts
const imageWidgets = computed(() => activeWidgets.value.filter(w => w.kind === 'image') as Extract<ActiveWidget, { kind: 'image' }>[])
const previewWidgets = computed(() => activeWidgets.value.filter(w => w.kind === 'preview') as Extract<ActiveWidget, { kind: 'preview' }>[])

function resolvePreviewElement (pointer: string): PageElement | undefined {
  const tree = draftElements.value ?? elements.value ?? []
  return findElementByPointer(tree, pointer) as PageElement | undefined
}
```

- [ ] **Step 6: Verify types and lint**

Run: `npm run check-types && npm run lint`
Expected: clean exit.

- [ ] **Step 7: Commit**

```bash
git add ui/src/components/page-edit/page-edit-elements-markup.vue
git commit -m "feat(ui): wire node-preview widgets into the markup editor"
```

---

## Task 9: Style the gutter toggle markers

**Files:**
- Modify: `ui/src/components/page-edit/page-edit-elements-markup.vue`

- [ ] **Step 1: Add gutter marker styles**

In `page-edit-elements-markup.vue`, append to the `<style scoped>` block:

```css
.markup-editor :deep(.cm-gutter-node-preview) {
  width: 20px;
  display: flex;
  justify-content: center;
}

.markup-editor :deep(.cm-gutter-node-preview-btn) {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.38);
  font-size: 0.75rem;
  line-height: 1;
}

.markup-editor :deep(.cm-gutter-node-preview-btn:hover) {
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.markup-editor :deep(.cm-gutter-node-preview-on) {
  color: rgb(var(--v-theme-primary));
}
```

- [ ] **Step 2: Manual smoke test in the browser**

The dev environment is managed externally — ask the user to confirm the gutter icon is clickable and the preview toggles on/off. Do not start or restart dev processes yourself.

If the user reports any issue, fix inline before committing.

- [ ] **Step 3: Commit**

```bash
git add ui/src/components/page-edit/page-edit-elements-markup.vue
git commit -m "style(markup): add styles for node-preview gutter markers"
```

---

## Task 10: End-to-end test

**Files:**
- Modify: `tests/features/ui/markup-edit.e2e.spec.ts`

- [ ] **Step 1: Add the e2e test**

Append a new test to `tests/features/ui/markup-edit.e2e.spec.ts` (keeping the existing imports and `test.describe` wrapper):

```ts
test('toggles a node preview on and off via the gutter marker', async ({ page, goToWithAuth, context }) => {
  const portal = (await user1.post('/api/portals', {
    config: { title: 'Preview Toggle Portal', menu: { children: [] } }
  })).data

  const createdPage = (await user1.post('/api/pages', {
    type: 'generic',
    config: {
      title: 'Preview Toggle Page',
      elements: [
        { type: 'title', titleSize: 'h2', content: 'Preview Hello' }
      ],
      genericMetadata: { slug: 'preview-toggle' }
    },
    portals: [portal._id],
    owner: portal.owner
  })).data

  await context.addInitScript(() => {
    try { window.localStorage.setItem('df-markup-edit', '1') } catch { /* ignore */ }
  })

  await goToWithAuth(
    `/portals-manager/pages/${createdPage._id}/edit-config`,
    'test_admin'
  )

  await expect(page.getByRole('button', { name: 'Balisage' })).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: 'Balisage' }).click()
  await expect(page.locator('.markup-editor .cm-content')).toBeVisible({ timeout: 5000 })

  // Toggle preview on for the first element (`/0`).
  const toggleBtn = page.locator('.cm-gutter-node-preview-btn[data-markup-preview-pointer="/0"]')
  await expect(toggleBtn).toBeVisible({ timeout: 5000 })
  await toggleBtn.click()

  // Preview widget should appear and render the title text.
  const widget = page.locator('.markup-preview-widget-frame')
  await expect(widget).toBeVisible({ timeout: 5000 })
  await expect(widget).toContainText('Preview Hello')

  // Toggle off — widget must disappear.
  await toggleBtn.click()
  await expect(widget).toHaveCount(0, { timeout: 5000 })
})
```

- [ ] **Step 2: Run the e2e test**

Run: `npm run test-e2e -- tests/features/ui/markup-edit.e2e.spec.ts`
Expected: the new test passes along with all existing markup-edit e2e tests.

- [ ] **Step 3: Commit**

```bash
git add tests/features/ui/markup-edit.e2e.spec.ts
git commit -m "test(markup): e2e for node-preview gutter toggle"
```

---

## Final verification

- [ ] **Run the full unit suite for markup**

Run: `npm run test -- tests/features/markup`
Expected: all markup unit tests (existing + new three files) pass.

- [ ] **Run type check and lint across the repo**

Run: `npm run check-types && npm run lint`
Expected: clean exit.

- [ ] **Verify the feature end-to-end in the browser**

Ask the user to open a page with a few elements, switch to markup mode, and exercise:
- Toggling a preview on and off on a leaf element (title, divider).
- Toggling a preview on a container (card) with children — confirm children render inside.
- Editing the element while a preview is visible — confirm the preview updates.
- Breaking the syntax briefly, then fixing it — confirm the preview persists across the transient parse failure.
