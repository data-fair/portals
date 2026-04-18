import { RangeSetBuilder, StateEffect, StateField, type Extension } from '@codemirror/state'
import {
  Decoration, EditorView, WidgetType,
  type DecorationSet
} from '@codemirror/view'
import { deserializeElements, type DeserializeError } from '../deserializer.ts'
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

/**
 * Shared parse state used by both the decoration field and the gutter.
 * Consolidates parsing so we don't deserialize the document multiple times
 * per transaction.
 */
interface MarkupParseState {
  sourceMap: MarkupSourceMap
  errors: ReadonlyArray<DeserializeError>
}

const markupParseStateField = StateField.define<MarkupParseState>({
  create: (state) => parseDoc(state.doc.toString()),
  update (value, tr) {
    if (!tr.docChanged) return value
    return parseDoc(tr.state.doc.toString())
  }
})

function parseDoc (doc: string): MarkupParseState {
  const { sourceMap, errors } = deserializeElements(doc)
  return { sourceMap, errors }
}

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
  parsed: MarkupParseState,
  toggled: ReadonlySet<string>,
  mount: MountPreview
): DecorationSet | null {
  const { sourceMap, errors } = parsed
  // If the document failed to parse (no element pointers AND the parser
  // reported errors) but the user has toggles on, return null as a
  // sentinel so the caller preserves the widget. A clean empty doc (no
  // errors, no pointers) is NOT a parse failure and falls through so
  // stale widgets unmount.
  if (sourceMap.byElementPointer.size === 0 && errors.length > 0 && toggled.size > 0) {
    return null
  }
  // NOTE: computeNodePreviewRanges's first parameter (`_doc`) is unused, so we
  // can pass an empty string. Keeping the param preserves the sibling-file
  // symmetry with computeImageUploadRanges.
  const ranges = computeNodePreviewRanges('', sourceMap, toggled)
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

/**
 * StateField that tracks the current decoration set for preview widgets.
 * Block decorations are not allowed via ViewPlugin in CM6, so we recompute
 * them here on every doc or toggle-state change and expose them through
 * `EditorView.decorations`. On transient parse failure, the previous
 * decoration set is preserved (so the widget stays visible mid-edit).
 */
function nodePreviewDecorationsField (mount: MountPreview) {
  return StateField.define<DecorationSet>({
    create (state) {
      const built = buildDecorations(state.field(markupParseStateField), state.field(nodePreviewState), mount)
      return built ?? Decoration.none
    },
    update (value, tr) {
      // Keep existing decoration positions in sync with doc changes.
      const mapped = tr.docChanged ? value.map(tr.changes) : value
      const toggled = tr.state.field(nodePreviewState)
      const parseChanged = tr.startState.field(markupParseStateField) !== tr.state.field(markupParseStateField)
      const toggleChanged = tr.startState.field(nodePreviewState) !== toggled
      if (!parseChanged && !toggleChanged) return mapped
      const built = buildDecorations(tr.state.field(markupParseStateField), toggled, mount)
      // Sentinel: on transient parse failure, keep the previously-mapped
      // decoration set so any already-mounted widget stays in the DOM
      // until the parser recovers. CM6's PointDecoration maps with
      // TrackDel, which drops points whose range is wholly deleted, so in
      // the pathological case of a full-doc replace the widget will still
      // be re-mounted when the parser picks up again.
      if (built === null) return mapped
      return built
    },
    provide: f => EditorView.decorations.from(f)
  })
}

/**
 * Bundle extension. Combines the toggle state field with a decoration
 * StateField that renders a block widget at each toggled element's end
 * offset.
 */
export function portalMarkupNodePreviewWidgets (
  opts: NodePreviewWidgetsOptions
): Extension[] {
  return [
    markupParseStateField,
    nodePreviewState,
    nodePreviewDecorationsField(opts.mountPreview)
  ]
}
