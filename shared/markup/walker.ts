import type { ChildrenSlot } from './types.ts'
import { tagDescriptors } from './tag-descriptors.ts'

/**
 * Depth-first traversal of page elements, driven by the generated tag descriptors.
 * Visits every real page element (not structured slot items like tab/panel wrappers).
 */
export function walkElements (
  elements: unknown,
  visit: (element: Record<string, any>) => void
): void {
  if (!Array.isArray(elements)) return
  for (const el of elements) {
    if (!el || typeof el !== 'object' || typeof (el as any).type !== 'string') continue
    const element = el as Record<string, any>
    visit(element)
    const descriptor = tagDescriptors[element.type]
    if (!descriptor) continue
    for (const slot of descriptor.childrenSlots) {
      walkSlot(element[slot.property], slot, visit)
    }
  }
}

function walkSlot (
  value: unknown,
  slot: ChildrenSlot,
  visit: (element: Record<string, any>) => void
): void {
  if (!Array.isArray(value)) return
  if (slot.kind === 'direct') {
    walkElements(value, visit)
  } else if (slot.kind === 'structured') {
    for (const item of value) {
      if (item && typeof item === 'object') walkElements((item as any).children, visit)
    }
  }
  // 'link' slots are leaves — not page elements
}

/**
 * Resolve a JSON pointer (relative to the elements-array root, e.g.
 * `/1/children/0`) to a page element. Numeric segments index into arrays;
 * string segments index into objects. Returns undefined for malformed
 * pointers, out-of-range indices, or any step that doesn't match the tree
 * shape.
 *
 * Tolerant by design: used by the markup preview widget which may race
 * against transient document states. Callers fall back to a "element
 * unavailable" placeholder on undefined.
 */
export function findElementByPointer (
  elements: unknown,
  pointer: string
): Record<string, any> | undefined {
  if (typeof pointer !== 'string' || pointer === '' || pointer === '/') return undefined
  if (!pointer.startsWith('/')) return undefined
  const segments = pointer.slice(1).split('/')
  let current: any = elements
  for (const seg of segments) {
    if (current == null) return undefined
    if (Array.isArray(current)) {
      const idx = Number(seg)
      if (!Number.isInteger(idx) || idx < 0 || idx >= current.length) return undefined
      current = current[idx]
    } else if (typeof current === 'object') {
      if (!(seg in current)) return undefined
      current = current[seg]
    } else {
      return undefined
    }
  }
  if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined
  return current as Record<string, any>
}
