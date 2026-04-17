import type { Diagnostic } from '@codemirror/lint'
import type { MarkupRange, MarkupSourceMap } from '../types.ts'

/**
 * Pure helpers that translate between a StatefulLayout-style node tree and
 * CodeMirror diagnostics / completion contexts, via a deserializer-produced
 * `MarkupSourceMap`. Kept framework-agnostic: we only consume a duck-typed
 * `{ dataPath, error, children }` shape so `@json-layout/core` stays a
 * peer concern of the UI layer, not of `shared/markup`.
 */

export interface ErrorNodeLike {
  dataPath?: string | null
  error?: string | null | undefined
  children?: ErrorNodeLike[] | undefined
}

export interface MarkupError {
  path: string
  message: string
}

export function collectErrorsByDataPath (root: ErrorNodeLike | null | undefined): MarkupError[] {
  const out: MarkupError[] = []
  const walk = (n: ErrorNodeLike | null | undefined) => {
    if (!n) return
    if (n.error) out.push({ path: n.dataPath ?? '', message: n.error })
    if (n.children) for (const c of n.children) walk(c)
  }
  walk(root)
  return out
}

export function findNodeByDataPath<T extends { dataPath?: string | null | undefined, children?: T[] | undefined }> (
  root: T | null | undefined,
  dataPath: string
): T | null {
  if (!root) return null
  if (root.dataPath === dataPath) return root
  if (!root.children) return null
  for (const c of root.children) {
    const found = findNodeByDataPath(c, dataPath)
    if (found) return found
  }
  return null
}

/**
 * Strip a dataPath prefix (the `elements` array node's dataPath) from an
 * absolute ajv-style instance path. Returns `null` when the input doesn't
 * belong to the prefixed subtree.
 */
export function toRelativePointer (prefix: string, fullPath: string): string | null {
  if (!prefix) return fullPath || '/'
  if (fullPath === prefix) return '/'
  if (!fullPath.startsWith(prefix + '/')) return null
  return fullPath.slice(prefix.length)
}

/**
 * Find the innermost element in the source map whose open-tag range contains
 * the given char offset. Used to derive "which element is the cursor in?" for
 * attribute-value autocomplete.
 */
export function offsetToElementPointer (sourceMap: MarkupSourceMap | null | undefined, offset: number): string | null {
  if (!sourceMap) return null
  let best: { pointer: string, size: number } | null = null
  for (const [pointer, range] of sourceMap.byElementPointer) {
    if (offset < range.from || offset > range.to) continue
    const size = range.to - range.from
    if (best === null || size < best.size) best = { pointer, size }
  }
  return best?.pointer ?? null
}

/**
 * Look up the best range for a JSON pointer: tightest (attribute value /
 * content) first, then element tag, then walk up ancestors (handles ajv
 * "required" errors whose instancePath ends at the parent object).
 */
export function resolveRange (sourceMap: MarkupSourceMap | null | undefined, pointer: string): MarkupRange | null {
  if (!sourceMap) return null
  const tight = sourceMap.byPointer.get(pointer)
  if (tight) return tight
  const elementRange = sourceMap.byElementPointer.get(pointer)
  if (elementRange) return elementRange
  let p = pointer
  while (p.length > 0 && p.includes('/')) {
    p = p.slice(0, p.lastIndexOf('/'))
    if (p === '') break
    const ancestor = sourceMap.byElementPointer.get(p) ?? sourceMap.byPointer.get(p)
    if (ancestor) return ancestor
  }
  return null
}

export function toCmDiagnostic (
  err: MarkupError,
  sourceMap: MarkupSourceMap | null | undefined,
  prefix: string,
  docLength: number
): Diagnostic | null {
  const pointer = toRelativePointer(prefix, err.path)
  if (pointer === null) return null
  const range = resolveRange(sourceMap, pointer)
  // An unresolved range used to fall back to [0, 1], which visually anchored
  // root-level errors (e.g. pointer === '/') to the first tag in the document
  // and misled the user into thinking the first tag was the problem. Drop the
  // diagnostic instead — form mode still surfaces the error and the user can
  // address it there.
  if (!range) return null
  const from = Math.max(0, Math.min(range.from, docLength))
  const to = Math.max(from + 1, Math.min(range.to, docLength))
  return { from, to, severity: 'error', message: err.message, source: 'schema' }
}
