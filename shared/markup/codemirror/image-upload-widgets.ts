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

      // Contiguity check: any outside-group attribute whose value range
      // falls inside [min, max] means the group is interleaved.
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
  // before the quote: walk back past `=` and the name until whitespace.
  while (start > 0 && doc[start - 1] !== ' ' && doc[start - 1] !== '\t' && doc[start - 1] !== '\n') start--
  // include one leading whitespace if present so we don't leave a stray space.
  if (start > 0 && /\s/.test(doc[start - 1])) start--
  let end = valueTo + 1 // past the closing quote
  while (end < doc.length && (doc[end] === ' ' || doc[end] === '\t')) end++
  return { from: start, to: end }
}

/**
 * Framework-agnostic CM6 ViewPlugin. Each time the document changes, it
 * rebuilds `Decoration.replace` widgets for every image-upload group
 * detected by `computeImageUploadRanges`. `mountWidget` is a host-provided
 * callback that mounts UI framework code (Vue, React, etc.) into the
 * widget's DOM container and returns an unmount function.
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
      if (u.docChanged) this.decorations = this.build(u.view)
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
