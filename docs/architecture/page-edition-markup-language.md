# Page Edition Markup Language

Architecture description for an alternative markup-based editing mode for portal pages.

## Motivation

The current page editor uses VJSF (Vue JSON Schema Form) to generate forms from the JSON Schema. This works well for simple pages but has real UX limitations:

- **Deep nesting is painful.** Editing a text inside a card inside a two-columns inside a banner means navigating 4 levels of dialog forms, losing sight of the overall structure.
- **Structural operations are awkward.** Moving an element between containers, reordering across nesting levels, copy-pasting subtrees — all require multiple clicks and are error-prone in a form UI.
- **AI-assisted editing needs a text representation.** LLMs handle HTML-like markup far better than deeply nested JSON. JSON nesting confusion grows with depth (for both humans and LLMs), while markup is the natural language for document structure.

The proposal: offer a secondary **markup editing mode** — a pseudo-HTML syntax derived from our element schema — alongside the existing form editor. Both modes share the same JSON Schema as single source of truth. The markup language, its validation, and its CodeMirror integration are all derived automatically from the schema.

## Design Principles

1. **JSON Schema remains the source of truth.** The markup language is a serialization format, not a new data model. Adding a new element type or property to the schema should automatically make it available in markup mode.
2. **Lossless round-tripping.** `JSON → markup → JSON` must be identity (modulo insignificant whitespace and attribute ordering). `markup → JSON → markup` must also preserve the user's formatting choices as much as possible.
3. **No type-specific serialization code.** The serializer/deserializer must be fully generic, driven by the schema. The moment we add per-type hacks, maintenance grows linearly with element count (currently 38 types).
4. **Incremental adoption.** The markup mode is opt-in. The form editor remains the default. Users can switch between modes at any time.

## Mapping Rules: JSON ↔ Markup

### Element tags

Each element `type` becomes a tag name. The JSON `type` field is implicit in the tag name and not serialized as an attribute.

```html
<!-- JSON: { "type": "title", "uuid": "a1b2c3d4", "content": "Hello", "titleSize": "h2" } -->
<title uuid="a1b2c3d4" titleSize="h2" content="Hello" />
```

### Property categories

Every property of an element falls into exactly one of these categories, which determines how it is serialized:

| Category | Serialization | Examples |
|---|---|---|
| **Tag name** | Tag itself | `type` |
| **Hidden** | Omitted from markup | `_html` (computed field) |
| **Children containers** | Nested elements | `children`, `children2`, `tabs`, `panels`, `advancedFilters` |
| **Text content** | Inner text of the element | `content` (for text, alert, title, divider) |
| **Simple attributes** | `key="value"` | `titleSize`, `centered`, `color`, `elevation` |
| **Object attributes** | `key.subkey="value"` | `background.color`, `align.left`, `line.position` |
| **Image attributes** | Special shorthand | `image`, `background.image`, `thumbnail.image` |

The category of each property is determined from the schema:
- Properties named `_html` or starting with `_` → hidden
- Properties whose schema is `{ type: 'array', items: { $ref: '...element' } }` → children container
- The `content` property on elements that have it → text content
- Properties with `type: 'object'` → object attributes (flattened with dot notation)
- Everything else → simple attributes

### Simple attributes

Scalar properties (string, number, boolean, enum) become XML attributes.

```html
<title titleSize="h2" centered="true" bold="true" color="primary" />
<card elevation="2" rounded="lg" border="true" />
<two-columns disposition="equal" gutter="dense" />
```

Type coercion rules:
- **boolean:** `"true"` / `"false"` (omitting an optional boolean attribute means it was not set, not `false`)
- **number:** string representation (`"0.8"`, `"3"`)
- **enum/const:** the string value itself

### Object attributes (dot notation)

Object-typed properties are flattened using dot notation. This avoids introducing nested XML for configuration objects.

```html
<!-- JSON: { "type": "title", "line": { "position": "bottom-small", "color": "primary" } } -->
<title line.position="bottom-small" line.color="primary" />

<!-- JSON: { "type": "two-columns", "align": { "left": "center", "right": "start" } } -->
<two-columns align.left="center" align.right="start" disposition="equal" gutter="default" />

<!-- JSON: { "type": "banner", "background": { "color": "primary", "tintStrength": 0.8 } } -->
<banner background.color="primary" background.tintStrength="0.8">
  ...
</banner>
```

Depth limit: dot notation goes **2 levels deep** (e.g., `actionStyle.config.color`). This covers all current schema patterns. Deeper nesting would need a different approach but doesn't exist today.

### Image attributes

Images use the same dot-notation as other object attributes. No shorthand — this keeps the serializer fully generic. If the verbosity becomes a problem, the better fix is to simplify the image schema itself (removing unnecessary object layers) rather than adding type-specific serialization.

```html
<image image._id="abc123" image.name="photo.jpg" image.mimeType="image/jpeg" />
```

### Text content (the `content` property)

Elements that have a `content` property (text, alert, title, divider) use it as the inner text of the tag. This is the most natural mapping since `content` is typically the main user-authored text.

```html
<text>
This is **markdown** content that can span
multiple lines.
</text>

<alert alertType="warning" title="Attention">
Some warning message in **markdown**.
</alert>

<title titleSize="h2">Page title here</title>
```

**Important constraint:** since `content` can contain HTML/markdown, and we're inside a pseudo-HTML syntax, we need clear rules:
- The inner text is treated as **raw text** (like HTML `<script>` or `<textarea>`) — it is NOT parsed as markup elements.
- The parser switches to raw-text mode when it enters a tag that has a `content` property in the schema.
- This is well-supported by rehype/hast — we can define these as "raw" elements during parsing.

### Children containers

Properties that hold arrays of child elements become nested markup. The property name determines the nesting structure.

**`children` (single children array):** direct nesting.

```html
<banner background.color="primary">
  <title titleSize="h2">Welcome</title>
  <text>Some introductory text.</text>
</banner>

<card elevation="1" rounded="lg">
  <text>Card content here.</text>
  <button label="Learn more" href="/about" />
</card>
```

**`children` + `children2` (two-columns):** uses named slots.

```html
<two-columns disposition="equal" gutter="default">
  <left>
    <text>Left column content.</text>
  </left>
  <right>
    <text>Right column content.</text>
  </right>
</two-columns>
```

Here `<left>` maps to `children` and `<right>` maps to `children2`. These are virtual tags (not real element types) that exist only as structural markers.

**`tabs` (array of `{ title, icon, children }`):** each tab becomes a `<tab>` element.

```html
<tabs align="center" border="true">
  <tab title="First tab">
    <text>Content of tab 1.</text>
  </tab>
  <tab title="Second tab">
    <text>Content of tab 2.</text>
  </tab>
</tabs>
```

**`panels` (expansion-panels):** same pattern.

```html
<expansion-panels elevation="1" multiple="true">
  <panel title="Section 1">
    <text>Accordion content 1.</text>
  </panel>
  <panel title="Section 2">
    <text>Accordion content 2.</text>
  </panel>
</expansion-panels>
```

**`advancedFilters` (catalog elements):** uses a `<filters>` virtual tag.

```html
<datasets-catalog defaultSort="createdAt:-1" columns="3">
  <filters>
    <text>Custom filter instructions here.</text>
  </filters>
</datasets-catalog>
```

### Self-closing tags

Elements without children or text content use self-closing syntax.

```html
<divider />
<search />
<image image._id="abc123" image.name="photo.jpg" image.mimeType="image/jpeg" />
<icon icon.mdi.name="home" icon.mdi.svgPath="M10,20V14H14V20..." />
```

## Full Example

A realistic page combining multiple element types and nesting levels:

```html
<banner background.color="primary" fullWidth="true" pt="8" pb="8">
  <title titleSize="h1" color="surface" centered="true">Open Data Portal</title>
  <text centered="true">
    Discover, explore and reuse our public datasets.
  </text>
  <search />
</banner>

<topics />

<two-columns disposition="equal" gutter="default">
  <left>
    <card elevation="1" rounded="lg" title="Latest datasets">
      <datasets-list mode="lastUpdated" limit="5" columns="1" />
    </card>
  </left>
  <right>
    <card elevation="1" rounded="lg" title="Featured visualizations">
      <applications-list mode="lastCreated" limit="3" columns="1" />
    </card>
  </right>
</two-columns>

<expansion-panels elevation="0" openFirst="true">
  <panel title="About this portal">
    <text>
      This portal provides access to **open data** published by our organization.
    </text>
  </panel>
  <panel title="How to contribute">
    <text>
      Contact us to suggest new datasets or report issues.
    </text>
    <contact />
  </panel>
</expansion-panels>
```

## Schema-Driven Derivation

The serializer and deserializer must be **fully generic**, driven by introspecting the JSON Schema at build time or startup. The process:

### Build-time schema analysis

Walk the `oneOf` array in the element schema. For each element type:

1. Read the `type.const` value → this is the tag name.
2. Classify every other property into one of the categories (children, content, simple, object, hidden) based on its schema shape.
3. Produce a **tag descriptor** object:

```typescript
interface TagDescriptor {
  tagName: string                          // e.g. "card"
  contentProperty: string | null           // e.g. "content" for text elements, null for containers
  childrenSlots: ChildrenSlot[]            // e.g. [{ property: "children", virtualTag: null }]
  attributes: AttributeDescriptor[]        // flat and dot-notation attributes
  hiddenProperties: string[]               // e.g. ["_html"]
}

interface ChildrenSlot {
  property: string                         // JSON property name: "children", "children2", "tabs", "panels", "advancedFilters"
  virtualTag: string | null                // e.g. "left", "right", "tab", "panel", "filters" — or null for direct nesting
  itemProperties?: AttributeDescriptor[]   // for tabs/panels: the title, icon attributes on each item
}

interface AttributeDescriptor {
  name: string          // attribute name in markup (possibly with dots)
  jsonPath: string[]    // path in JSON object, e.g. ["background", "color"]
  type: 'string' | 'number' | 'boolean' | 'enum'
  enumValues?: string[]
  required: boolean
  default?: unknown
}
```

This descriptor map is the **single artifact** that drives serialization, deserialization, validation error mapping, and CodeMirror language support.

### Serialization (JSON → Markup)

```
for each element in elements[]:
  1. look up TagDescriptor by element.type
  2. open tag: <{tagName}
  3. for each attribute in descriptor.attributes:
       read value from element using jsonPath
       if value !== undefined and value !== default: emit key="value"
  4. if element has contentProperty and no childrenSlots with content:
       emit >{content}</{tagName}>
  5. else if element has childrenSlots:
       emit >
       for each slot:
         if slot.virtualTag: emit <{virtualTag} ...itemProps>
         recursively serialize slot's children array
         if slot.virtualTag: emit </{virtualTag}>
       emit </{tagName}>
  6. else: emit />
```

### Deserialization (Markup → JSON)

Uses rehype to parse the markup as HTML, producing a hast (HTML Abstract Syntax Tree). Then:

```
for each hast element node:
  1. look up TagDescriptor by node.tagName
  2. create JSON object with type = tagName
  3. for each attribute on the node:
       find matching AttributeDescriptor
       coerce string value to target type
       set value at jsonPath in the JSON object
  4. if descriptor.contentProperty:
       extract raw text children → set as content
  5. for each childrenSlot:
       if slot.virtualTag: find child node with that tag name
       recursively deserialize the children
       set on the appropriate JSON property
```

## Editor Integration (CodeMirror)

### Language support

**Approach: custom Lezer grammar (~50-100 lines).** The grammar is **lenient** — it accepts any tag name and any attribute name as valid syntax. Tag/attribute validation happens post-parse via ajv on the deserialized JSON. This means:

- The grammar never needs updating when element types change.
- Typos in tag names appear as validation diagnostics (red underlines), not syntax errors.
- The grammar only needs to handle: open/close/self-closing tags, dot-notation attributes, quoted attribute values, and raw text content blocks.

Tag descriptors drive **completion and validation** only, not parsing.

### Features to provide

- **Syntax highlighting:** tag names, attributes, values, content text, virtual tags (dimmed/italic)
- **Autocomplete:** tag names from descriptor map, attribute names per tag, enum values for attributes
- **Validation diagnostics:** red underlines on errors, mapped from JSON Schema validation (see below)
- **Folding:** collapse children blocks, tab/panel contents
- **Formatting:** auto-indent nested elements on paste or format command

### Validation error mapping

This is the hardest part of the integration. The flow:

1. User edits markup in CodeMirror
2. On change (debounced): deserialize markup → JSON
3. Validate JSON against the JSON Schema (using ajv)
4. Map each validation error's JSON path back to a source position in the markup

Step 4 requires maintaining a **source map** during deserialization: for each JSON node produced, record the hast node (which carries `position: { start: { line, column, offset }, end: { ... } }`) that generated it.

```typescript
interface SourceMap {
  // Maps a JSON path (e.g. "elements.2.children.0.color") to a markup source range
  get(jsonPath: string): { from: number, to: number } | null
}
```

The source map is a flat `Map<string, { from: number, to: number }>` keyed by JSON path. Key rules:
- Attribute-level errors (e.g., invalid enum value) → highlight the specific attribute in the markup, not the whole tag.
- Missing required property errors → highlight the opening tag (since there's no attribute to point to).
- Errors in `content` (markdown validation if any) → highlight the text range.
- Errors deep in nested objects (e.g., `background.image._id` missing) → map to the corresponding dot-notation attribute.

### Parse error recovery

When the markup has syntax errors (unclosed tags, malformed attributes), the editor should:
- Show the syntax error inline (CodeMirror's built-in error recovery for Lezer grammars handles this)
- Still attempt partial deserialization of the valid portions (for live preview)
- NOT update the JSON model until the markup is syntactically valid

**Error recovery strategy:** when the markup has syntax errors, the preview keeps showing the **last fully valid state**. The JSON model is only updated when the markup is syntactically valid and passes deserialization. Lezer's built-in error recovery handles syntax highlighting and bracket matching in the editor even during errors.

## Integration with the Page Editor UI

### Mode switching

The page config editor gets a toggle: **Form** | **Markup**. When switching:

- **Form → Markup:** serialize current JSON to markup, populate CodeMirror
- **Markup → Form:** deserialize markup to JSON, rebuild VJSF form
- If the markup has errors when switching to Form mode: block the switch and show the errors

Both modes operate on the same underlying JSON model (`draftConfig.elements`). The markup is never persisted — it is always serialized/deserialized on the fly.

### Live preview

The existing element preview components (`page-element.vue`, `page-elements.vue`) work from JSON. When in markup mode:
- Deserialize on each valid change (debounced)
- Feed the JSON to the same preview pipeline
- Invalid markup → keep showing the last valid preview

### Scope of markup mode

The markup mode covers `config.elements` only — the page-level metadata (title, description, slug, thumbnail, etc.) remains in the form editor. This keeps the markup focused on the document structure where it adds the most value.

## Technical Stack

| Component | Library | Role |
|---|---|---|
| Markup parsing | [rehype](https://github.com/rehypejs/rehype) / [hast](https://github.com/syntax-tree/hast) | Parse markup string → syntax tree |
| Tree traversal | [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) | Walk hast nodes during deserialization |
| Source positions | [vfile](https://github.com/vfile/vfile) | Attach position info and diagnostics |
| Code editor | [CodeMirror 6](https://codemirror.net/) | In-browser editor with extensions |
| Syntax grammar | [Lezer](https://lezer.codemirror.net/) | Parser generator for CodeMirror |
| JSON validation | [ajv](https://ajv.js.org/) | Validate deserialized JSON against schema |
| Vue integration | [vue-codemirror](https://github.com/surmon-china/vue-codemirror) or direct | Mount CodeMirror in Vue component |

## Resolved Decisions

### Serialization details

- **Attribute ordering:** derived from the VJSF `layout.children` annotations in the schema. Flatten the layout tree in order to get the canonical attribute sequence. `uuid` always comes first (identity), then the rest follows the layout order (which groups structural before styling). This ensures markup order matches what users see in form mode.
- **Whitespace / formatting:** 2-space indentation. Line breaks between sibling elements. Long attribute lists wrap one-per-line when exceeding ~100 characters, with continuation attributes indented to align with the first attribute. Blank line between top-level element blocks for readability.
- **Default value omission:** preserve explicit values. The JSON model tracks whether a value was explicitly set by the user (even if it equals the schema default), so the serializer emits all values present in the JSON. This ensures lossless round-tripping.
- **Image attributes:** use standard dot-notation (`image._id`, `image.name`, `image.mimeType`). No shorthand. If verbosity is a problem, the schema itself should be simplified (remove unnecessary object layers) rather than adding type-specific serialization.

### Complex nested objects

- **`cardConfig`:** uses dot-notation like all other object attributes. The nesting goes 3 levels deep (e.g., `cardConfig.thumbnail.default._id`) which is within the 2-level dot-notation limit if we count `cardConfig.thumbnail` as level 1. Properties deeper than the dot-notation limit are serialized but may be verbose — this is acceptable for card configuration which is a power-user feature.
- **`icon` objects:** serialize all properties including `svgPath` as dot-notation attributes. Long SVG path strings are valid attribute values; they are not pretty but they are correct and generic. No special handling.
- **`actions` arrays:** use `<action>` virtual tags, consistent with the pattern for `<tab>`, `<panel>`, `<filters>`:

```html
<card title="My card">
  <action label="Learn more" href="/about" />
  <action label="Download" href="/download" icon="mdi-download" />
</card>
```

### Editor UX

- **Undo/redo:** single undo stack shared across modes. Mode switches serialize/deserialize and push a new state onto the stack. Markup may be reformatted when switching back — this is acceptable.
- **Partial markup editing:** not in v1. Full-page markup mode only. Subtree editing can be added later without architectural changes.
- **Error density:** progressive disclosure (show first N errors, expandable) — to be refined during implementation.

### Build and packaging

- **Schema analysis timing:** tag descriptors generated at build time as part of the existing type generation pipeline.
- **Lezer grammar:** hand-written, small (~50-100 lines), generic, and stable. Accepts any tag/attribute — never needs updating when elements change. Tag descriptors drive completion and validation only, not parsing.

### AI-assisted editing

Skipped for v1. The markup mode is valuable on its own for manual editing. AI integration can be added later — the markup format is inherently LLM-friendly and the tag descriptors provide all the context an AI prompt would need.

### Testing strategy

- **Round-trip property tests.** For every element type: generate random valid JSON from the schema → serialize to markup → deserialize back → assert deep equality. This is the most important test and can be fully automated.
- **Error mapping tests.** For a set of known-invalid markups: parse, validate, check that diagnostics point to the correct line/column.
- **CodeMirror integration tests.** Likely manual / snapshot-based. Focus on: syntax highlighting correctness, autocomplete relevance, folding behavior.
