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
