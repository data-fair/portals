/**
 * For each image-upload group declared on an element's descriptor, emit up to
 * three CM6 decorations: a `widget` replacing the `_id` attribute, `hide`
 * ranges erasing the `name`/`mimeType` attributes, and a `point` widget on
 * bare tags with no group attributes at all.
 *
 * Markup text on disk is unchanged — the decoration layer only changes how
 * attributes render in CM6.
 */
import { Decoration, ViewPlugin, WidgetType, type EditorView, type DecorationSet, type ViewUpdate } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { tagDescriptors } from '../tag-descriptors.ts'
import type { ImageUploadGroup, MarkupSourceMap } from '../types.ts'
import { markupParseStateField } from './parse-state.ts'

const AUX_LEAVES = ['name', 'mimeType'] as const

export type ImageUploadRange =
  | { kind: 'widget', from: number, to: number, elementPointer: string, group: ImageUploadGroup }
  | { kind: 'hide', from: number, to: number, elementPointer: string, group: ImageUploadGroup }
  | { kind: 'point', from: number, to: number, elementPointer: string, group: ImageUploadGroup }

export function computeImageUploadRanges (
  doc: string,
  sourceMap: MarkupSourceMap
): ImageUploadRange[] {
  const out: ImageUploadRange[] = []

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

      if (!idRange && auxRanges.length === 0) {
        const pos = insideTagEndPosition(doc, elementRange.to, groupIdx)
        if (pos !== null) out.push({ kind: 'point', from: pos, to: pos, elementPointer, group })
      }
    })
  }

  return out
}

// `groupIdx` offset gives each empty group on the same element a distinct
// insertion position so RangeSetBuilder can order them deterministically.
function insideTagEndPosition (doc: string, openTagEnd: number, groupIdx: number): number | null {
  let pos = openTagEnd - 1
  if (pos < 0 || doc[pos] !== '>') return null
  if (pos > 0 && doc[pos - 1] === '/') pos--
  pos -= groupIdx
  if (pos < 0) return null
  return pos
}

function readTagName (doc: string, openTagStart: number): string | null {
  if (doc[openTagStart] !== '<') return null
  let i = openTagStart + 1
  const start = i
  while (i < doc.length && /[A-Za-z0-9-]/.test(doc[i])) i++
  return i > start ? doc.slice(start, i) : null
}

// Widen an attribute-value range to cover the whole `name="value"` span plus
// adjacent whitespace, so replace-decorations don't leave stray gaps.
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
      const parseChanged = u.startState.field(markupParseStateField) !== u.state.field(markupParseStateField)
      if (parseChanged) this.decorations = this.build(u.view)
      else if (u.docChanged) this.decorations = this.decorations.map(u.changes)
    }

    build (view: EditorView): DecorationSet {
      const { sourceMap } = view.state.field(markupParseStateField)
      const doc = view.state.doc.toString()
      const ranges = computeImageUploadRanges(doc, sourceMap)
      // RangeSetBuilder requires non-decreasing `from`, then non-decreasing
      // `to`. At the same offset, order widget before hide so the widget
      // claims the position.
      ranges.sort((a, b) => a.from - b.from || a.to - b.to || (a.kind === 'hide' ? 1 : -1))
      const builder = new RangeSetBuilder<Decoration>()
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
