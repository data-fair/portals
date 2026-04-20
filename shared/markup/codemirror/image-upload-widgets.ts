/**
 * Inline image-upload widgets for the markup editor. The widget is only shown
 * when the set of image attributes (`_id`, `name`, `mimeType`) is both
 * complete AND textually contiguous — otherwise we fall back to plain text
 * and let the linter nudge the user, or the next serialize cycle normalize
 * ordering. A bare-tag case (no image attrs at all) gets an insertion-point
 * widget instead so users can click to upload.
 */
import { Decoration, ViewPlugin, WidgetType, type EditorView, type DecorationSet, type ViewUpdate } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { deserializeElements } from '../deserializer.ts'
import type { ImageUploadGroup, MarkupSourceMap, TagDescriptor } from '../types.ts'

export interface ImageUploadRange {
  from: number
  to: number
  elementPointer: string
  group: ImageUploadGroup
}

/** Attribute positioned inside an element's open tag, with its full textual span. */
interface ElementAttr {
  path: string[]
  from: number
  to: number
}

const REQUIRED_LEAVES = ['_id', 'name', 'mimeType'] as const

/**
 * Compute the textual span covering every in-group attribute, or `null` when
 * the group cannot be rendered as a widget. Returns null when:
 *  - the required leaves aren't all present (partial state);
 *  - any outside-group attribute falls textually inside the group's span
 *    (interleaved attrs).
 */
export function contiguousGroupSpan (
  doc: string,
  inGroup: ElementAttr[],
  outsideGroup: ElementAttr[],
  prefix: string[]
): { from: number, to: number } | null {
  const leafNames = new Set(inGroup.map(a => a.path[prefix.length]).filter(Boolean))
  if (!REQUIRED_LEAVES.every(r => leafNames.has(r))) return null

  // Attribute ranges point at the *value* span (between quotes). Extend each
  // to cover `name="value"` plus trailing whitespace so the widget hides the
  // whole attribute text.
  const spans = inGroup.map(a => attributeFullSpan(doc, a.from, a.to))
  let from = Number.POSITIVE_INFINITY
  let to = 0
  for (const s of spans) {
    if (s.from < from) from = s.from
    if (s.to > to) to = s.to
  }

  // Any outside-group attribute whose value range falls inside [from, to]
  // means the group is interleaved with unrelated attrs.
  for (const a of outsideGroup) {
    if (a.from >= from && a.to <= to) return null
  }
  return { from, to }
}

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

    const elementAttrs: ElementAttr[] = []
    for (const attr of descriptor.attributes) {
      const pointer = `${elementPointer}/${attr.jsonPath.join('/')}`
      const range = sourceMap.byPointer.get(pointer)
      if (!range) continue
      elementAttrs.push({ path: attr.jsonPath, from: range.from, to: range.to })
    }

    // When the whole tag has no image-related attrs across any of its
    // image-upload groups, insert an upload-prompt widget per group just
    // before the closing `/>` (or `>`). This covers the "bare tag" case
    // like `<image />`. For partial states (some attrs present), widgets
    // are skipped and the linter nudges the user to finish the set.
    const isBareTag = descriptor.imageUploadGroups.every(g =>
      !elementAttrs.some(a => startsWithPath(a.path, g.jsonPath))
    )

    descriptor.imageUploadGroups.forEach((group, groupIdx) => {
      const prefix = group.jsonPath
      const inGroup = elementAttrs.filter(a => startsWithPath(a.path, prefix))
      const outsideGroup = elementAttrs.filter(a => !startsWithPath(a.path, prefix))

      if (inGroup.length === 0) {
        if (!isBareTag) return
        const pos = insideTagEndPosition(doc, elementRange.to, groupIdx)
        if (pos !== null) out.push({ from: pos, to: pos, elementPointer, group })
        return
      }

      const span = contiguousGroupSpan(doc, inGroup, outsideGroup, prefix)
      if (!span) return
      out.push({ from: span.from, to: span.to, elementPointer, group })
    })
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

/**
 * Pick a character position inside the open-tag syntax just before the closing
 * `/>` (or `>`), shifted by `groupIdx` characters so that multiple empty
 * groups on the same element get distinct insertion points the RangeSetBuilder
 * can order. Returns null if the tag is too short for the requested offset
 * (e.g. a pathological malformed tag).
 */
function insideTagEndPosition (doc: string, openTagEnd: number, groupIdx: number): number | null {
  // openTagEnd is one past the final '>'. Walk back past '>' and an optional '/'.
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
        const widget = new ImageUploadWidgetType({ elementPointer: r.elementPointer, group: r.group }, opts.mountWidget)
        // Point ranges are insertions inside an otherwise bare tag; CM6's
        // Decoration.widget handles those. Non-empty ranges replace existing
        // attribute text with the widget.
        const deco = r.from === r.to
          ? Decoration.widget({ widget, side: 1 })
          : Decoration.replace({ widget })
        builder.add(r.from, r.to, deco)
      }
      return builder.finish()
    }
  }, { decorations: v => v.decorations })
}
