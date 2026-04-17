import type { AttributeDescriptor, ChildrenSlot, TagDescriptor } from './types.ts'
import { tagDescriptors } from './tag-descriptors.ts'

const INDENT = '  '

function escapeAttr (value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function escapeContent (value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

function getAt (obj: any, path: string[]): unknown {
  let cur: any = obj
  for (const segment of path) {
    if (cur == null) return undefined
    cur = cur[segment]
  }
  return cur
}

function formatAttrValue (value: unknown, attr: AttributeDescriptor): string {
  switch (attr.type) {
    case 'boolean':
      return value ? 'true' : 'false'
    case 'number':
    case 'integer':
      return String(value)
    case 'string-array':
      return escapeAttr(Array.isArray(value) ? value.map(String).join(',') : String(value))
    case 'string':
    default:
      return escapeAttr(String(value))
  }
}

function sameArray (a: unknown, b: unknown): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

function shouldEmitAttr (value: unknown, attr: AttributeDescriptor): boolean {
  if (value === undefined || value === null) return false
  if (attr.default !== undefined) {
    if (attr.type === 'string-array' ? sameArray(value, attr.default) : value === attr.default) return false
  }
  return true
}

function serializeAttrs (
  obj: Record<string, unknown>,
  attrs: AttributeDescriptor[]
): string {
  const parts: string[] = []
  for (const attr of attrs) {
    const value = getAt(obj, attr.jsonPath)
    if (!shouldEmitAttr(value, attr)) continue
    parts.push(`${attr.name}="${formatAttrValue(value, attr)}"`)
  }
  return parts.length ? ' ' + parts.join(' ') : ''
}

function isNonEmpty (slots: ChildrenSlot[], item: Record<string, unknown>, contentProperty: string | null): boolean {
  if (contentProperty && item[contentProperty] != null && item[contentProperty] !== '') return true
  for (const slot of slots) {
    const value = item[slot.property]
    if (Array.isArray(value) && value.length > 0) return true
  }
  return false
}

function serializeSlotValue (slot: ChildrenSlot, value: unknown, depth: number): string {
  if (!Array.isArray(value) || value.length === 0) return ''
  if (slot.kind === 'direct') {
    return value.map(el => serializeElement(el, depth)).filter(Boolean).join('\n')
  }
  if (slot.kind === 'structured') {
    const pad = INDENT.repeat(depth)
    const tag = slot.virtualTag ?? slot.property
    return value.map((item: any) => {
      const attrs = serializeAttrs(item, slot.itemAttributes ?? [])
      const children = Array.isArray(item.children)
        ? item.children.map((el: any) => serializeElement(el, depth + 1)).filter(Boolean).join('\n')
        : ''
      if (!children) return `${pad}<${tag}${attrs} />`
      return `${pad}<${tag}${attrs}>\n${children}\n${pad}</${tag}>`
    }).join('\n')
  }
  // link
  const pad = INDENT.repeat(depth)
  const tag = slot.virtualTag ?? slot.property
  return value.map((item: any) => {
    const attrs = serializeAttrs(item, slot.itemAttributes ?? [])
    return `${pad}<${tag}${attrs} />`
  }).join('\n')
}

function serializeChildrenSlots (
  item: Record<string, unknown>,
  slots: ChildrenSlot[],
  depth: number
): string {
  const blocks: string[] = []
  for (const slot of slots) {
    const value = item[slot.property]
    if (!Array.isArray(value) || value.length === 0) continue
    if (slot.virtualTag && slot.kind === 'direct') {
      const pad = INDENT.repeat(depth)
      const inner = value.map((el: any) => serializeElement(el, depth + 1)).filter(Boolean).join('\n')
      if (!inner) continue
      blocks.push(`${pad}<${slot.virtualTag}>\n${inner}\n${pad}</${slot.virtualTag}>`)
    } else {
      const rendered = serializeSlotValue(slot, value, depth)
      if (rendered) blocks.push(rendered)
    }
  }
  return blocks.join('\n')
}

function serializeElement (element: any, depth: number): string {
  if (!element || typeof element !== 'object' || typeof element.type !== 'string') return ''
  const descriptor: TagDescriptor | undefined = tagDescriptors[element.type]
  if (!descriptor) return ''

  const pad = INDENT.repeat(depth)
  const tag = descriptor.tagName
  const attrString = serializeAttrs(element, descriptor.attributes)

  const contentProp = descriptor.contentProperty
  const rawContent = contentProp ? element[contentProp] : undefined
  const hasContent = contentProp && rawContent != null && rawContent !== ''
  const hasChildren = descriptor.childrenSlots.some(s => {
    const v = element[s.property]
    return Array.isArray(v) && v.length > 0
  })

  if (!hasContent && !hasChildren && !isNonEmpty(descriptor.childrenSlots, element, contentProp)) {
    return `${pad}<${tag}${attrString} />`
  }

  if (hasContent && !hasChildren) {
    const content = escapeContent(String(rawContent))
    if (content.includes('\n')) {
      return `${pad}<${tag}${attrString}>\n${content}\n${pad}</${tag}>`
    }
    return `${pad}<${tag}${attrString}>${content}</${tag}>`
  }

  const childrenBlock = serializeChildrenSlots(element, descriptor.childrenSlots, depth + 1)
  if (!childrenBlock) return `${pad}<${tag}${attrString} />`
  return `${pad}<${tag}${attrString}>\n${childrenBlock}\n${pad}</${tag}>`
}

/**
 * Serialize a page-elements array to markup text.
 */
export function serializeElements (elements: unknown[]): string {
  if (!Array.isArray(elements)) return ''
  return elements.map(el => serializeElement(el, 0)).filter(Boolean).join('\n')
}
