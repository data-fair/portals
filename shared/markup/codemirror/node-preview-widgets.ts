import { StateEffect, StateField, type Extension } from '@codemirror/state'
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

/**
 * Bundle extension. Step 3 exports only the state plumbing; the gutter and
 * ViewPlugin are added by later tasks. Returning an array of `Extension`
 * from day one keeps the public shape stable.
 */
export function portalMarkupNodePreviewWidgets (
  _opts: NodePreviewWidgetsOptions
): Extension[] {
  return [nodePreviewState]
}
