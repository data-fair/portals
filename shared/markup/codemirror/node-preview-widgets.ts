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
