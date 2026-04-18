# Markup node preview widget — design

## Goal

Let the user toggle an inline preview of any element directly inside the markup editor. Clicking a gutter icon next to an element's opening tag renders that element — with its live children if it's a container — as a block widget below the element's source. Clicking again hides it. Multiple previews may be pinned at once.

## Context

The page-edit markup editor (`ui/src/components/page-edit/page-edit-elements-markup.vue`) already uses the CM6 `WidgetType` + Vue `<teleport>` pattern for image-upload widgets (`shared/markup/codemirror/image-upload-widgets.ts`). The same plumbing can host element previews.

A ready-to-use renderer exists: `ui/src/components/page/page-preview-element.vue`. It dispatches to `<page-element>`, which is auto-resolved by `unplugin-vue-components` to the portal's `portal/app/components/page-element/page-element.vue` via the component scan in `ui/vite.config.ts`. This means previews render with the same components the live portal uses, inheriting Vuetify/i18n/session plugins from the UI app.

Source-map data is already available: `MarkupSourceMap.byElementPointer` returns `{ from, to }` for every element, keyed by JSON pointer (`/0`, `/1/children/0`, ...).

## UX decisions

- **Trigger**: gutter icon (one per element) next to the line containing the element's opening tag. Click toggles the preview on/off.
- **Scope**: every element type, including containers. Containers render their live children (the existing `page-elements` slot on `<page-preview-element>` already wires this up).
- **Position**: block widget immediately after the element's closing tag (`</tag>` or self-closing `/>`). Container source stays contiguous.
- **Live updates**: preview re-renders while the user types, driven by the deserialize that already runs on every doc change (via `updateListener` feeding a `draftElements` ref). A transient unparseable state keeps the previous preview visible; a per-element validation error still renders (the child components tolerate missing fields), with errors surfacing through the existing lint channel.
- **Lifetime**: toggle state is in-memory in the CM6 extension. It resets on component remount (e.g. switching to Form mode and back).
- **Identity**: toggles are keyed by element pointer (path-based). Inserting a sibling before a toggled node shifts the toggle to whatever is now at that path. Accepted as v1 behavior; consistent with how image-upload widgets already track elements.

## Architecture

Two code locations, mirroring the image-upload widget split:

### `shared/markup/codemirror/node-preview-widgets.ts` — framework-agnostic

Exports `portalMarkupNodePreviewWidgets(opts): Extension[]`. The extension array bundles:

- **`toggleNodePreview`** — `StateEffect<{ elementPointer: string }>`.
- **`nodePreviewState`** — `StateField<Set<string>>`. Initial value: empty set. Reducer applies `toggleNodePreview` by adding/removing the pointer.
- **`nodePreviewGutter`** — a CM6 `gutter({ markers })` that emits a clickable `GutterMarker` on each line containing the start of an element. Marker reads `nodePreviewState` to swap its icon class (on vs. off). `mousedown` dispatches `toggleNodePreview` and returns `true` to stop CM6's default click handling. Computation walks `sourceMap.byElementPointer` once per rebuild, deduplicating by line number.
- **`NodePreviewWidgetType`** — `WidgetType`. `toDOM()` creates a `div.markup-node-preview-widget` container, calls `opts.mountPreview(container, { elementPointer })`, stores the returned unmount fn for `destroy()`. `eq()` compares `elementPointer` (keeps the same DOM + mounted component across doc edits that only move the element's `to` offset). `estimatedHeight` returns a conservative fallback (e.g. 80) so first-layout measurement doesn't jitter.
- **`nodePreviewWidgetsPlugin`** — `ViewPlugin` that rebuilds `Decoration.widget` (block, `side: 1`) at each toggled element's `to` offset. Rebuild triggers: `update.docChanged`, or toggle state changed (`update.startState.field(nodePreviewState) !== update.state.field(nodePreviewState)`). It parses the doc inline to read `sourceMap` — same reason as the image-upload plugin: `ViewPlugin.update` runs before `updateListener`s.

Exported pure helper (testable without CM6 runtime):

```ts
computeNodePreviewRanges(
  doc: string,
  sourceMap: MarkupSourceMap,
  toggled: ReadonlySet<string>
): Array<{ from: number, to: number, elementPointer: string }>
```

Options interface:

```ts
interface MountPreviewArgs { elementPointer: string }
type MountPreview = (container: HTMLElement, args: MountPreviewArgs) => () => void
interface NodePreviewWidgetsOptions { mountPreview: MountPreview }
```

Re-exported through `shared/markup/codemirror/index.ts`.

### `ui/src/components/page-edit/page-edit-elements-markup.vue` — host

Changes:

- Extend `ActiveWidget` into a discriminated union: `{ kind: 'image', ... }` | `{ kind: 'preview', key, host, elementPointer }`.
- Pass a `mountPreview` callback into `portalMarkupNodePreviewWidgets(...)` that pushes a `{ kind: 'preview' }` entry into `activeWidgets` and returns an unmount fn that removes the entry by `key` (not by pointer — the image-upload widget already uses this pattern to stay safe across rapid toggles).
- Add a second `<teleport v-for>` block rendering `<page-preview-element>` for every `kind: 'preview'` entry.
- Maintain a `draftElements = shallowRef<PageElement[] | null>(null)`:
  - `EditorView.updateListener` populates it from the last successful `deserializeElements(doc).elements` while the user types.
  - `applyChange` (fires on blur) clears it.
  - The preview's `modelValue` is computed as `findElementByPointer(draftElements.value ?? elements.value, elementPointer)`.
- Wrap the teleported `<page-preview-element>` in a small error boundary (Vue `onErrorCaptured` at the markup editor root, or a new single-purpose `<error-boundary>` component in `ui/src/components/`). On error: render a muted "preview failed" note.

### New pure helper — `findElementByPointer`

Lives in `shared/markup/walker.ts` (or a new sibling if that file grows too large). Walks a `PageElement[]` tree by JSON pointer segments, returning the element or `undefined`. No CM6 dependency.

## Data flow

**Toggle (gutter click):**
1. Gutter marker `mousedown` → `view.dispatch({ effects: toggleNodePreview.of({ elementPointer }) })`.
2. `StateField` reducer flips the pointer in the set.
3. `ViewPlugin.update` sees the field changed → rebuilds decorations.
4. New widget: CM6 calls `toDOM()` → host's `mountPreview` pushes an `activeWidgets` entry → Vue teleports `<page-preview-element>` into the container.
5. Removed widget: CM6 calls `destroy()` → host's unmount callback filters the entry out → teleport unmounts.

**Edit (user types):**
1. `ViewPlugin.update` re-parses `sourceMap`, rebuilds decorations.
2. Toggled pointer still present in `byElementPointer`: widget relocates to the new `to`. `eq()` matches, so the existing `WidgetType` instance (and the Vue component inside) is preserved.
3. Pointer gone (element deleted): decoration dropped, `destroy()` fires, preview unmounts.
4. `updateListener` updates `draftElements` if the doc parses, or leaves it alone if parsing fails.
5. `<page-preview-element>`'s `computed` re-reads the element from `draftElements.value` and re-renders.

**Blur (existing `applyChange`):**
1. `draftElements` is cleared; preview now reads from `elements.value` (which `applyChange` just updated).

## Error handling

| Case | Handling |
|---|---|
| Document unparseable mid-typing | `ViewPlugin` skips rebuild when `sourceMap.byElementPointer` is empty; existing widgets stay visible. `draftElements` is not overwritten, so previews show last-good content. |
| Element fails ajv validation | No special path. `<page-preview-element>` renders as-is; children already tolerate missing fields. Errors surface through the existing lint channel. |
| Element pointer can't resolve | `findElementByPointer` returns `undefined` → preview renders a muted placeholder ("element unavailable"). Covers transient races and the gap between CM6 widget drop and Vue reactivity. |
| Preview component throws | Error boundary around the teleported `<page-preview-element>` logs once and renders a muted "preview failed" note. One bad element can't break the editor or other previews. |
| Mount/destroy ordering races | Unmount callback closes over a unique `key` (widgetSeq pattern from the image-upload widget). Host filters `activeWidgets` by `key`, so rapid toggles on the same pointer can't double-register or drop each other. |

## Testing

- **`tests/features/markup/node-preview-widgets.unit.spec.ts`** — pure coverage for `computeNodePreviewRanges`:
  - Empty toggle set → no ranges.
  - Single top-level element toggled → range at `byElementPointer[pointer].to`.
  - Nested element inside container → correct range.
  - Pointer missing from source map → range omitted.
  - Multiple toggled → ranges sorted by `from`.
  - Self-closing and open/close tags both covered.

- **`tests/features/markup/node-preview-pointer-resolution.unit.spec.ts`** — `findElementByPointer`:
  - Top-level (`/0`, `/3`), nested (`/1/children/0`), out-of-range (`/99`), malformed (`''`, `'/'`, `'/abc'`).

- **`tests/features/markup/node-preview-integration.unit.spec.ts`** — CM6 integration in jsdom (follow `stateful-layout-bridge.unit.spec.ts`):
  - Dispatch `toggleNodePreview` → block widget decoration exists at the element's `to`; `mountPreview` called once with the right pointer.
  - Dispatch toggle off → `destroy()` and unmount fire exactly once.
  - Edit shifts element's `to` → widget relocates; `mountPreview` is *not* re-called (same `eq()`); unmount is *not* called.
  - Edit deletes the toggled element → widget dropped; unmount fires.
  - Inject bad text → existing widgets preserved; next good parse keeps them.

- **`tests/features/ui/markup-edit.e2e.spec.ts`** — one focused extension:
  - Open edit-config → markup mode → click gutter icon on a `<title>` → assert preview text visible below. Toggle off → assert gone.
  - One nested case: toggle an inner element inside a `<card>` → assert preview renders.

Out of scope for v1: visual regression, perf benchmarks for heavy nested previews (reserved for `tests/perf-seed.e2e.spec.ts` if it becomes a concern).

## Non-goals / deferred

- Persisting toggle state across remount/reload (localStorage or server-side).
- Stable synthetic element IDs (would eliminate pointer drift on sibling insertion).
- Floating "current-node" preview panel.
- Keyboard shortcut to toggle the preview at the cursor.
