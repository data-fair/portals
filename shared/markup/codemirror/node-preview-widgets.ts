import { RangeSetBuilder, StateEffect, StateField, type Extension } from '@codemirror/state'
import {
  Decoration, EditorView, WidgetType, gutter, GutterMarker,
  type DecorationSet
} from '@codemirror/view'
import type { MarkupSourceMap } from '../types.ts'
import { markupParseStateField, type MarkupParseState } from './parse-state.ts'

export interface NodePreviewRange {
  from: number
  to: number
  elementPointer: string
}

export function computeNodePreviewRanges (
  sourceMap: MarkupSourceMap,
  toggled: ReadonlySet<string>
): NodePreviewRange[] {
  const out: NodePreviewRange[] = []
  if (toggled.size === 0) return out
  for (const pointer of toggled) {
    const range = sourceMap.byElementPointer.get(pointer)
    if (!range) continue
    out.push({ from: range.to, to: range.to, elementPointer: pointer })
  }
  out.sort((a, b) => a.from - b.from)
  return out
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

class NodePreviewGutterMarker extends GutterMarker {
  constructor (
    readonly elementPointer: string,
    readonly isOn: boolean,
    // Captured at build time so the mousedown handler can dispatch without
    // walking the DOM. `EditorView.findFromDOM(btn)` is not reliable here —
    // it fails in jsdom and can return null if the button is clicked before
    // CM6 has fully attached the gutter to the editor root. Held by
    // reference, not by identity: excluded from `eq()` so CM6 can still
    // reuse the rendered DOM node across identical states.
    readonly view: EditorView
  ) { super() }

  toDOM (): HTMLElement {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'cm-gutter-node-preview-btn' + (this.isOn ? ' cm-gutter-node-preview-on' : '')
    btn.setAttribute('data-markup-preview-pointer', this.elementPointer)
    btn.setAttribute('aria-label', this.isOn ? 'Hide preview' : 'Show preview')
    btn.setAttribute('aria-pressed', this.isOn ? 'true' : 'false')
    btn.textContent = this.isOn ? '\u25CF' : '\u25CB'
    btn.addEventListener('mousedown', (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      this.view.dispatch({ effects: toggleNodePreview.of({ elementPointer: this.elementPointer }) })
    })
    return btn
  }

  eq (other: GutterMarker): boolean {
    return other instanceof NodePreviewGutterMarker &&
      other.elementPointer === this.elementPointer &&
      other.isOn === this.isOn
  }
}

function buildDecorations (
  parsed: MarkupParseState,
  toggled: ReadonlySet<string>,
  mount: MountPreview
): DecorationSet | null {
  const { sourceMap, errors } = parsed
  // Transient-parse sentinel: return null so the caller preserves the existing
  // (mapped) widget set. A clean empty doc (no errors, no pointers) still
  // falls through, letting stale widgets unmount.
  if (sourceMap.byElementPointer.size === 0 && errors.length > 0 && toggled.size > 0) {
    return null
  }
  const ranges = computeNodePreviewRanges(sourceMap, toggled)
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

// Block decorations aren't allowed via ViewPlugin in CM6, so we drive the
// decoration set through a StateField. On transient parse failure the
// previous (mapped) set is preserved so the widget stays visible mid-edit.
function nodePreviewDecorationsField (mount: MountPreview) {
  return StateField.define<DecorationSet>({
    create (state) {
      const built = buildDecorations(state.field(markupParseStateField), state.field(nodePreviewState), mount)
      return built ?? Decoration.none
    },
    update (value, tr) {
      const mapped = tr.docChanged ? value.map(tr.changes) : value
      const toggled = tr.state.field(nodePreviewState)
      const parseChanged = tr.startState.field(markupParseStateField) !== tr.state.field(markupParseStateField)
      const toggleChanged = tr.startState.field(nodePreviewState) !== toggled
      if (!parseChanged && !toggleChanged) return mapped
      const built = buildDecorations(tr.state.field(markupParseStateField), toggled, mount)
      if (built === null) return mapped
      return built
    },
    provide: f => EditorView.decorations.from(f)
  })
}

function buildGutterMarkers (view: EditorView): ReturnType<RangeSetBuilder<GutterMarker>['finish']> {
  const { sourceMap } = view.state.field(markupParseStateField)
  const toggled = view.state.field(nodePreviewState)
  const perLine = new Map<number, { pos: number, pointer: string }>()
  for (const [pointer, range] of sourceMap.byElementPointer) {
    const line = view.state.doc.lineAt(range.from)
    if (!perLine.has(line.number)) {
      perLine.set(line.number, { pos: line.from, pointer })
    }
  }
  const builder = new RangeSetBuilder<GutterMarker>()
  for (const { pos, pointer } of [...perLine.values()].sort((a, b) => a.pos - b.pos)) {
    builder.add(pos, pos, new NodePreviewGutterMarker(pointer, toggled.has(pointer), view))
  }
  return builder.finish()
}

function nodePreviewGutterExtension () {
  return gutter({
    class: 'cm-gutter-node-preview',
    markers: (view) => buildGutterMarkers(view),
    lineMarkerChange: (u) =>
      u.docChanged ||
      u.startState.field(nodePreviewState) !== u.state.field(nodePreviewState)
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
    nodePreviewDecorationsField(opts.mountPreview),
    nodePreviewGutterExtension()
  ]
}
