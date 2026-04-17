# Design: Image-upload widget in markup editor

## Context

The page-edit markup editor (`ui/src/components/page-edit/page-edit-elements-markup.vue`) currently renders page elements as plain text with CodeMirror: syntax highlighting, schema-driven autocomplete, and inline ajv diagnostics. Interactive widgets described in the parent plan (`docs/architecture/hybrid-markup-widgets.md`) have not been implemented.

This doc covers the first interactor type: **image-upload**. Every property whose JSON Schema declares `layout.slots.component.name === 'image-upload'` (today: `image`, `wideImage`, `background.image`, `thumbnail.image`, and more) should render a file-input widget inline in the markup — instead of users manually typing `_id`, `name`, `mimeType`.

Search-select and multi-select interactors are out of scope; they will reuse the same plugin shape but target different schemas.

## Scope

- All schema sites declaring `image-upload` slots, detected globally by the schema analyzer — not just `<image>`.
- Page context only. Markup mode is only mounted from `ui/src/pages/pages/[pageId]/edit-config.vue`, so the upload endpoint receives `{ type: 'page', _id }`.
- Read/write through the shared StatefulLayout, reusing the existing `image-upload.vue` component.

## Data flow

Widget interaction mirrors form mode:

```
User clicks file input (inside CM6 widget)
  → CM6 blur fires → applyChange() commits any pending text edits
  → user picks file → image-upload.vue POSTs → receives image ref
  → widget calls statefulLayout.input(node, imageRef)
  → vjsf onData fires → elements model updates
  → refreshFromElements watcher runs → serializeElements()
  → CM6 dispatch updates the document
  → ViewPlugin rebuilds decorations → widget re-renders with new thumbnail
```

No new sync loop; the existing text↔model plumbing carries widget-originated changes.

## Schema analyzer changes

**Files:** `build/markup/schema-analyzer.ts`, `shared/markup/types.ts`

Add to `TagDescriptor`:

```ts
imageUploadGroups?: ImageUploadGroup[]
```

with

```ts
interface ImageUploadGroup {
  /** Path to the object property that carries the image-upload slot, e.g. ["image"], ["background","image"] */
  jsonPath: string[]
  /** Attribute descriptor names that belong to this group (the flattened leaves) */
  attributeNames: string[]
  /** Slot props, for passing to <image-upload> */
  width?: number
  height?: number
  /** Slot label, kept as a raw string (not yet localized — the schema stores French labels today) */
  label?: string
  /** layout.if expression verbatim, for informational use; the widget delegates visibility to the StatefulLayout */
  ifExpression?: string | null
}
```

The analyzer walk: when `flattenObjectAttributes` encounters an object whose schema has `layout.slots.component.name === 'image-upload'`, record an `ImageUploadGroup` on the element's `TagDescriptor` in addition to still emitting the flattened leaf attributes (so plain-text editing, completion, and validation continue to work).

Attribute descriptors themselves are unchanged. The group is supplementary metadata.

## CodeMirror widget plugin

**New file:** `shared/markup/codemirror/image-upload-widgets.ts`

A `ViewPlugin` factory that takes:

```ts
portalMarkupImageUploadWidgets({
  tagDescriptors: Record<string, TagDescriptor>,
  mountWidget: (container: HTMLElement, args: {
    elementPointer: string,
    group: ImageUploadGroup,
  }) => () => void  // returns unmount
}): Extension
```

On every `docChanged`, the plugin deserializes the current document to obtain a fresh source map (CM6 runs `ViewPlugin.update()` before any `updateListener`, so relying on an externally-maintained source map would read stale data), and then:

1. Iterates elements via `sourceMap.byElementPointer`.
2. For each element, looks up the `TagDescriptor` by tag name (from a small helper that reads the opening-tag token) and iterates its `imageUploadGroups`.
3. For each group, collects the attribute ranges (`sourceMap.byPointer.get(elementPointer + '/' + jsonPath.join('/') + '/' + leaf)`), then:
   - If **all** attribute ranges are present and the min→max span covers **only** those attributes plus whitespace (contiguous), emits a `Decoration.replace` over that span with a `WidgetType` that calls `mountWidget(container, …)` in `toDOM()` and invokes the returned unmount in `destroy()`.
   - Otherwise, skips the group (plain text survives; blur-triggered re-serialization will normalize ordering).

Keeping this factory in `shared/` with a `mountWidget` callback preserves the framework-agnostic boundary that `shared/markup/codemirror/bridge.ts` already establishes — no Vue dependency leaks into `shared/`.

## Vue widget component

**New file:** `ui/src/components/markup-widgets/markup-image-widget.vue`

Props: `elementPointer`, `group`. Injected: `markup-stateful-layout`, `markup-elements-data-path`, `markup-resource`.

Render logic:

1. `targetPath = markupElementsDataPath + elementPointer + '/' + group.jsonPath.join('/')`
2. `node = findNodeByDataPath(statefulLayout.stateTree.root, targetPath)` — re-evaluated on every render so StatefulLayout rebuilds are picked up automatically.
3. If `node` is null (e.g. `layout.if` evaluated false, or data not yet applied) → render a disabled placeholder span showing the original attribute text. This is a transient state: the next `applyChange` serialize cycle removes stale attributes from the text, which rebuilds decorations without this group. `node.data === undefined` (node exists, no image set) renders the empty upload input normally.
4. Otherwise render:

```html
<image-upload
  :model-value="node.data"
  :label="group.label"
  :width="group.width"
  :height="group.height"
  :resource="markupResource"
  hide-details="auto"
  @update:model-value="data => statefulLayout.input(node, data)"
/>
```

Reactive props: the component is rebuilt whenever the plugin rebuilds the widget, which happens on `docChanged` — so node resolution naturally re-runs.

## Wiring in the editor component

**File:** `ui/src/components/page-edit/page-edit-elements-markup.vue`

- Import `tagDescriptors`, `portalMarkupImageUploadWidgets`, `createApp`, `MarkupImageWidget`.
- Build a `pageRef` (same pattern as `page-edit-elements.vue`): `{ type: 'page', _id: inject('page-id') }`.
- Add the plugin to `buildExtensions()`:

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

Each `WidgetType.destroy()` calls the unmount function returned from `mountWidget`. Widget count per page is small (0–3), so per-widget `createApp` overhead is negligible.

## Edge cases

| Case | Behavior |
|---|---|
| Some group attrs missing | Plugin skips the group; linter already flags missing `required` attrs. |
| Attrs interleaved with unrelated ones | Plugin skips decoration; text stays visible. Serializer normalizes order on next blur. |
| User typing mid-edit | File-input focus pulls focus out of CM6 → blur → `applyChange()` commits first. |
| `layout.if` hides the group | Widget renders a disabled placeholder showing the original attribute text; next serialize cycle removes the stale attrs and the decoration is dropped. |
| Rapid doc changes | Plugin rebuilds decorations on `docChanged`; Vue apps mount/unmount each cycle — acceptable for small widget counts. |

## Testing

1. **`tests/features/markup/image-upload-group.unit.spec.ts`** — `analyzeSchemas` produces `imageUploadGroups` on:
   - `<image>` (two groups: `image`, `wideImage`)
   - elements with `background.image`
   - elements with `thumbnail.image`
   - card-style elements under `common-*-card`
2. **`tests/features/markup/image-upload-widgets.unit.spec.ts`** — given a synthetic doc + source map + tag descriptors, `portalMarkupImageUploadWidgets` (with a mock `mountWidget`) emits `Decoration.replace` at the expected ranges; interleaved attributes ⇒ no decoration; missing attrs ⇒ no decoration.
3. **Manual / e2e**: open page edit-config, switch to markup mode, verify widget appears on `<image>` element, upload file, verify markup updates and form mode shows the same image.

## Files summary

| File | Action |
|---|---|
| `shared/markup/types.ts` | Add `ImageUploadGroup` + `imageUploadGroups?` on `TagDescriptor`. |
| `build/markup/schema-analyzer.ts` | Detect `image-upload` slot, emit groups. |
| `shared/markup/tag-descriptors.ts` | Regenerated via `npm run build-types`. |
| `shared/markup/codemirror/image-upload-widgets.ts` | New: ViewPlugin factory. |
| `shared/markup/codemirror/index.ts` | Re-export. |
| `ui/src/components/markup-widgets/markup-image-widget.vue` | New: Vue widget. |
| `ui/src/components/page-edit/page-edit-elements-markup.vue` | Wire `mountWidget`, extend `buildExtensions`. |
| `tests/features/markup/image-upload-group.unit.spec.ts` | New. |
| `tests/features/markup/image-upload-widgets.unit.spec.ts` | New. |

## Verification

1. `npm run build-types` — `imageUploadGroups` present in regenerated tag descriptors.
2. `npm run test-unit -- tests/features/markup/image-upload-group` — schema analyzer tests pass.
3. `npm run test-unit -- tests/features/markup/image-upload-widgets` — plugin tests pass.
4. `npm run check-types` — no type errors.
5. `npm run lint` — clean.
6. Manual: page edit-config → markup mode → add `<image>` element via form mode → switch to markup mode → widget renders → upload → markup text updates with new `image._id`/`image.name`/`image.mimeType` → switch back to form mode → image preview unchanged.
