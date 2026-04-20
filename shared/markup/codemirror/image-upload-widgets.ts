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
