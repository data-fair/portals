/**
 * Builds a `MarkupSourceMap` from the `ParsedTag` tree produced by `parse.ts`.
 * Populated on a best-effort basis: entries exist for every fully-parsed
 * tag/attribute regardless of whether the overall parse succeeded. Consumed
 * by the CM6 bridge to anchor schema errors and by the widget extensions
 * to locate element ranges.
 */
import type { AttributeDescriptor, ChildrenSlot, MarkupRange, MarkupSourceMap } from './types.ts'
import type { ParsedTag } from './parse.ts'
import { tagDescriptors } from './tag-descriptors.ts'

export function newSourceMap (): MarkupSourceMap {
  return { byPointer: new Map(), byElementPointer: new Map() }
}

function recordElementPosition (tag: ParsedTag, pointer: string, sourceMap: MarkupSourceMap): void {
  const openRange: MarkupRange = { from: tag.tagStart, to: tag.openTagEnd }
  sourceMap.byElementPointer.set(pointer, openRange)
  if (!sourceMap.byPointer.has(pointer)) sourceMap.byPointer.set(pointer, openRange)
}

function recordAttributes (
  tag: ParsedTag,
  pointer: string,
  attrs: AttributeDescriptor[],
  sourceMap: MarkupSourceMap
): void {
  const attrsByName = new Map(attrs.map(a => [a.name, a]))
  for (const [attrName, ranges] of Object.entries(tag.attrRanges)) {
    const attr = attrsByName.get(attrName)
    if (!attr) continue
    const attrPointer = `${pointer}/${attr.jsonPath.join('/')}`
    sourceMap.byPointer.set(attrPointer, ranges.value)
  }
}

/**
 * Record ranges for a tag and recurse into children, synthesizing JSON
 * pointers that match the shape `deserializer.buildElement` produces — so
 * virtual slot tags (`<tab>`, `<panel>`, `<action>`) never appear in the
 * pointer path, but their items contribute array indices under the slot
 * property they belong to.
 */
export function populateElementSourceMap (
  tag: ParsedTag,
  pointer: string,
  sourceMap: MarkupSourceMap
): void {
  const descriptor = tagDescriptors[tag.name]
  if (!descriptor) return
  recordElementPosition(tag, pointer, sourceMap)
  recordAttributes(tag, pointer, descriptor.attributes, sourceMap)

  if (descriptor.contentProperty) {
    if (tag.contentStart !== undefined && tag.contentEnd !== undefined) {
      sourceMap.byPointer.set(
        `${pointer}/${descriptor.contentProperty}`,
        { from: tag.contentStart, to: tag.contentEnd }
      )
    }
    return
  }

  if (descriptor.childrenSlots.length === 0) return

  const slotsByVirtualTag = new Map<string, ChildrenSlot>()
  let directSlot: ChildrenSlot | null = null
  for (const slot of descriptor.childrenSlots) {
    if (slot.virtualTag) slotsByVirtualTag.set(slot.virtualTag, slot)
    else directSlot = slot
  }

  const indexByProperty: Record<string, number> = {}

  for (const child of tag.children) {
    const virtualSlot = slotsByVirtualTag.get(child.name)
    if (virtualSlot) {
      const slotProp = virtualSlot.property
      if (virtualSlot.kind === 'direct') {
        // Virtual wrapper has no JSON correspondence; each grandchild is a page element.
        for (const grandchild of child.children) {
          indexByProperty[slotProp] ??= 0
          const gcPointer = `${pointer}/${slotProp}/${indexByProperty[slotProp]++}`
          populateElementSourceMap(grandchild, gcPointer, sourceMap)
        }
      } else if (virtualSlot.kind === 'structured') {
        indexByProperty[slotProp] ??= 0
        const itemIdx = indexByProperty[slotProp]++
        const itemPointer = `${pointer}/${slotProp}/${itemIdx}`
        recordElementPosition(child, itemPointer, sourceMap)
        recordAttributes(child, itemPointer, virtualSlot.itemAttributes ?? [], sourceMap)
        for (let i = 0; i < child.children.length; i++) {
          const gcPointer = `${itemPointer}/children/${i}`
          populateElementSourceMap(child.children[i], gcPointer, sourceMap)
        }
      } else {
        // link — self-closing item
        indexByProperty[slotProp] ??= 0
        const itemIdx = indexByProperty[slotProp]++
        const itemPointer = `${pointer}/${slotProp}/${itemIdx}`
        recordElementPosition(child, itemPointer, sourceMap)
        recordAttributes(child, itemPointer, virtualSlot.itemAttributes ?? [], sourceMap)
      }
      continue
    }
    if (directSlot) {
      const slotProp = directSlot.property
      indexByProperty[slotProp] ??= 0
      const childPointer = `${pointer}/${slotProp}/${indexByProperty[slotProp]++}`
      populateElementSourceMap(child, childPointer, sourceMap)
    }
  }
}
