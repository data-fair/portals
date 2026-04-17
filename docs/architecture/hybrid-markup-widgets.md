# Plan: Hybrid Markup Editor with Shared StatefulLayout

## Context

The current markup language plan (docs/architecture/) treats all attributes as plain text `key="value"` in CodeMirror. This works for simple scalars but creates a major UX regression for properties that need runtime UI:

- **`getItems` properties** (e.g., `application` on element-application) — need searchable API-backed selects, not raw ID typing
- **`image-upload` slots** (e.g., `image` on element-image) — need file upload, not manual `_id`/`name`/`mimeType` entry
- **Array-of-objects with `getItems`** (e.g., `applications` on applications-list) — not even representable as plain attributes

These use `layout.getItems` and `layout.slots` — runtime json-layout features that the current build-time TagDescriptor extraction ignores entirely.

## CodeMirror 6 can do hybrid markup + widgets

CM6's decoration system supports this natively:
- `Decoration.replace` — visually replaces a text range with arbitrary DOM (a Vue-mounted select, upload button, etc.) while keeping the underlying text in the document
- `WidgetType.toDOM()` — returns any DOM element, can mount Vue components via `createApp`
- `ViewPlugin` — recomputes decorations on document changes

The text stays as source of truth (readable, diffable, LLM-friendly). Widgets are a visual overlay for properties that need interactive editing.

## Core architectural decision: shared StatefulLayout

Instead of having the markup editor manage its own state, **both form mode and markup mode share the same StatefulLayout instance**.

The vjsf component already creates a StatefulLayout and exposes it via `@update:state`. The parent component (`page-edit-elements.vue`) can hold a reference to it and pass it to the markup editor. Both modes read from and write to the same StatefulLayout:

- **Form mode**: VJSF renders the StatefulLayout as forms (current behavior)
- **Markup mode**: CodeMirror renders the StatefulLayout's data as text + inline widgets
- **Mode switching**: No serialization/deserialization needed — just change which renderer is active
- **Validation, expressions, getItems**: All shared through the single StatefulLayout

```
┌─────────────────────────────────────────────┐
│            StatefulLayout (shared)           │
│   - stateTree with StateNodes               │
│   - input(), getItems(), validate()         │
│   - onData callback → elements model        │
└──────────┬──────────────────┬───────────────┘
           │                  │
    ┌──────▼──────┐   ┌──────▼──────────────┐
    │  Form mode  │   │   Markup mode        │
    │  (vjsf)     │   │  (CodeMirror)        │
    │             │   │  text + widgets      │
    │  renders    │   │  widgets delegate to │
    │  StateNodes │   │  StatefulLayout      │
    │  as forms   │   │  nodes for getItems, │
    │             │   │  image-upload, etc.  │
    └─────────────┘   └─────────────────────┘
```

### How markup mode uses the StatefulLayout

1. **Serialize**: Walk `statefulLayout.stateTree.root` → produce markup text for CM6
2. **Widgets**: For each element node, find child StateNodes whose schema has `getItems`/`image-upload`. Create CM6 `Decoration.replace` widgets that render Vue components. These components call `statefulLayout.getItems(node, q)` for autocomplete and `statefulLayout.input(node, data)` for updates.
3. **Text edits**: When the user edits plain text attributes in CM6, deserialize the change and call `statefulLayout.input()` on the appropriate node.
4. **StatefulLayout → CM6 sync**: When the StatefulLayout updates (e.g., from a widget interaction), re-serialize the affected element and update the CM6 document via transaction.

### Benefits of sharing

- **Zero duplication**: Same getItems logic, same expression evaluation, same slots
- **Free mode switching**: No serialize/deserialize on toggle — just swap renderers
- **Consistent validation**: Same ajv validation, same error state, shared across modes
- **layout.if conditions**: StatefulLayout already computes which properties are visible/hidden — widgets can respect this
- **Future-proof**: Any json-layout improvement (caching, new interactors) automatically available in markup mode

## Inventory of widget-needing properties

| Category | Examples | Widget | StatefulLayout method |
|---|---|---|---|
| Single-object getItems | `application`, `dataset`, `event`, `reuse`, `news` | Searchable autocomplete | `getItems(node, q)` |
| Array-of-objects getItems | `applications[]`, `datasets[]`, `reuses[]` | Multi-select chips | `getItems(node, q)` |
| Image upload | `image`, `wideImage`, `background.image` | Upload + thumbnail | `input(node, data)` via slot |
| Colors/enums | `color`, `background.color` | **No widget needed** — CM6 enum autocomplete suffices | — |

## Serialization format decisions

### Array-of-objects → virtual tags (per user choice)

```html
<applications-list mode="custom" columns="3">
  <app id="a1" title="App 1" />
  <app id="a2" title="App 2" />
</applications-list>
```

This extends the existing ChildrenSlot pattern. Each array-of-objects property gets a new slot with `kind: 'link'` (already in the type system) and a virtual tag name derived from the item type.

Virtual tag mapping for getItems arrays:
| Property | Virtual tag | On element |
|---|---|---|
| `applications` | `<app>` | applications-list |
| `datasets` | `<dataset-ref>` | datasets-list |
| `events` | `<event-ref>` | events-list |
| `reuses` | `<reuse-ref>` | reuses-list |
| `news` | `<news-ref>` | news-list |

### Single-object getItems → dot-notation (unchanged)

```html
<application application.id="abc" application.title="My App" application.slug="my-app" />
```

The widget visually replaces these attributes with a searchable select. The text stays for round-tripping.

### Image → dot-notation (unchanged)

```html
<image image._id="abc" image.name="photo.jpg" image.mimeType="image/jpeg" />
```

Widget shows a thumbnail + upload button.

## Implementation outline

### Step 1: Extend schema analyzer for interactor metadata

**Files:** `build/markup/schema-analyzer.ts`, `shared/markup/types.ts`

Add to `AttributeDescriptor`:
```typescript
/** If present, this attribute (or group) needs an interactive widget */
interactor?: {
  kind: 'search-select' | 'search-multi-select' | 'image-upload'
}
```

Add new `ChildrenSlot` entries for array-of-objects with `getItems` (kind `'link'`, new virtual tags).

The schema analyzer detects:
- `layout.getItems` on object properties → `interactor: { kind: 'search-select' }`
- `layout.getItems` on array properties → new ChildrenSlot with virtual tag
- `layout.slots.component.name === 'image-upload'` → `interactor: { kind: 'image-upload' }`

### Step 2: Serializer/deserializer support for new virtual tags

**Files:** `shared/markup/serializer.ts`, `shared/markup/deserializer.ts`

Array-of-objects serializes as repeated virtual tags (same pattern as `<tab>`, `<panel>`). Each item's properties become attributes on the virtual tag.

### Step 3: Capture StatefulLayout reference from vjsf

**File:** `ui/src/components/page-edit/page-edit-elements.vue`

Listen to `@update:state` on `vjsf-page-elements` to capture the StatefulLayout instance. Store in a ref that both form mode and markup mode can access.

### Step 4: CM6 interactor widget plugin

**File:** `shared/markup/codemirror/interactor-widgets.ts`

A `ViewPlugin` that:
1. After parse, identifies attribute ranges matching interactor-backed properties (using TagDescriptors)
2. Creates `Decoration.replace` for each interactor group
3. Each `WidgetType` mounts a Vue component via `createApp` that receives:
   - The StateNode (found by navigating StatefulLayout's stateTree by fullKey)
   - The StatefulLayout instance (for `getItems()`, `input()`)
4. Widget changes → `statefulLayout.input(node, newData)` → StatefulLayout's `onData` callback fires → elements model updates → re-serialize affected element → CM6 transaction

### Step 5: Widget Vue components

**Dir:** `ui/src/components/markup-widgets/`

- `markup-search-select.vue` — `v-autocomplete` powered by `statefulLayout.getItems(node, q)`. On select, calls `statefulLayout.input(node, selectedItem)`.
- `markup-multi-select.vue` — `v-autocomplete multiple chips`, same pattern.
- `markup-image-widget.vue` — wraps existing `image-upload.vue`. Receives `node` and `statefulLayout`, uses same slot pattern as `page-edit-elements.vue`.

Each widget mounts inside a CM6 `WidgetType.toDOM()` span via `createApp()`. Widget count per page is small (typically 0-10), so per-widget `createApp` overhead is negligible.

### Step 6: Bidirectional sync

**File:** `ui/src/composables/use-markup-editor.ts`

The composable manages the sync loop:

```
StatefulLayout.data changes → serialize to markup → CM6 dispatch
CM6 text edit → deserialize affected element → statefulLayout.input()
Widget interaction → statefulLayout.input() → onData → serialize → CM6 dispatch
```

Key: debounce text → StatefulLayout updates. Use CM6 annotations to distinguish "text edited by user" from "text updated by sync" to avoid feedback loops.

### Step 7: Mode toggle wiring

**File:** `ui/src/components/page-edit/page-edit-markup.vue`

When switching Form → Markup: serialize StatefulLayout's current data to markup text, initialize CM6 with it and the interactor widget plugin.

When switching Markup → Form: if there are pending text edits not yet synced, deserialize and sync first. Then just hide CM6 and show VJSF — both already point at the same StatefulLayout.

## Key files to modify/create

| File | Action | Purpose |
|---|---|---|
| `shared/markup/types.ts` | Modify | Add `interactor` field to `AttributeDescriptor` |
| `build/markup/schema-analyzer.ts` | Modify | Detect `layout.getItems`, `layout.slots` |
| `shared/markup/serializer.ts` | Create | JSON → markup (milestone 2, with virtual tag support) |
| `shared/markup/deserializer.ts` | Create | Markup → JSON (milestone 3, with virtual tag support) |
| `shared/markup/codemirror/interactor-widgets.ts` | Create | CM6 ViewPlugin + WidgetType for interactors |
| `ui/src/components/markup-widgets/*.vue` | Create | Vue widget components |
| `ui/src/composables/use-markup-editor.ts` | Create | Bidirectional sync composable |
| `ui/src/components/page-edit/page-edit-elements.vue` | Modify | Capture StatefulLayout ref, add mode toggle |
| `ui/src/components/page-edit/page-edit-markup.vue` | Create | CM6 wrapper component |

## Verification

1. `npm run build-types` — interactor metadata correctly extracted in tag descriptors
2. Round-trip tests: elements with getItems arrays serialize as virtual tags and deserialize back
3. Dev mode: open page editor, toggle to Markup mode
4. Widget rendering: application/dataset selects appear inline in the markup
5. Widget interaction: pick an application → markup text updates → preview updates
6. Text editing: manually edit `application.id="..."` → StatefulLayout reflects the change
7. Mode switch: edit in markup, switch to form → form shows same state, no data loss
8. Image upload: click widget → upload → markup shows `_id`/`name`/`mimeType` → preview shows image
