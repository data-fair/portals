import type { AttributeDescriptor, ChildrenSlot, MarkupRange, MarkupSourceMap, TagDescriptor } from './types.ts'
import { tagDescriptors } from './tag-descriptors.ts'
import { walkElements } from './walker.ts'

const UUID_TYPES = new Set(['application', 'dataset-table'])

function newShortUuid (): string {
  return globalThis.crypto.randomUUID().split('-')[0]
}

/**
 * Fill missing uuids and regenerate duplicates for element types that depend on
 * uuid uniqueness (iframe-hosting elements). Runs after a successful parse so
 * copy-pasted markup yields elements with distinct uuids.
 */
function healUuids (elements: any[]): void {
  const seen = new Set<string>()
  walkElements(elements, (element) => {
    if (!UUID_TYPES.has(element.type)) return
    const current = element.uuid
    if (typeof current !== 'string' || current === '' || seen.has(current)) {
      let next = newShortUuid()
      while (seen.has(next)) next = newShortUuid()
      element.uuid = next
      seen.add(next)
    } else {
      seen.add(current)
    }
  })
}

export interface DeserializeError {
  line: number
  col: number
  message: string
}

export interface DeserializeResult {
  elements: any[] | null
  errors: DeserializeError[]
  /**
   * Mapping from JSON pointer (relative to the elements-array root) to markup
   * character ranges. Populated on a best-effort basis — entries exist for
   * every fully-parsed tag/attribute regardless of whether the overall parse
   * succeeded.
   */
  sourceMap: MarkupSourceMap
}

interface Parser {
  src: string
  pos: number
  line: number
  col: number
  errors: DeserializeError[]
}

function makeParser (src: string): Parser {
  return { src, pos: 0, line: 1, col: 1, errors: [] }
}

function advance (p: Parser, n: number): void {
  for (let i = 0; i < n && p.pos < p.src.length; i++) {
    if (p.src[p.pos] === '\n') { p.line++; p.col = 1 } else { p.col++ }
    p.pos++
  }
}

function skipWhitespace (p: Parser): void {
  while (p.pos < p.src.length && /\s/.test(p.src[p.pos])) advance(p, 1)
}

function error (p: Parser, message: string, line = p.line, col = p.col): void {
  p.errors.push({ line, col, message })
}

function unescapeAttr (value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
}

function unescapeContent (value: string): string {
  return value.replace(/&lt;/g, '<').replace(/&amp;/g, '&')
}

function parseIdent (p: Parser): string {
  const start = p.pos
  while (p.pos < p.src.length && /[A-Za-z0-9_.-]/.test(p.src[p.pos])) advance(p, 1)
  return p.src.slice(start, p.pos)
}

interface AttrRange {
  name: MarkupRange
  value: MarkupRange
}

function parseAttributes (p: Parser, attrRanges: Record<string, AttrRange>): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (;;) {
    skipWhitespace(p)
    if (p.pos >= p.src.length) return attrs
    const ch = p.src[p.pos]
    if (ch === '>' || ch === '/') return attrs
    const nameLine = p.line
    const nameCol = p.col
    const nameFrom = p.pos
    const name = parseIdent(p)
    const nameTo = p.pos
    if (!name) {
      error(p, `unexpected character '${ch}' in attributes`, nameLine, nameCol)
      advance(p, 1)
      continue
    }
    skipWhitespace(p)
    if (p.src[p.pos] !== '=') {
      error(p, `expected '=' after attribute '${name}'`, p.line, p.col)
      continue
    }
    advance(p, 1) // =
    skipWhitespace(p)
    if (p.src[p.pos] !== '"') {
      error(p, `expected '"' after '=' for attribute '${name}'`, p.line, p.col)
      continue
    }
    advance(p, 1) // opening "
    const valFrom = p.pos
    while (p.pos < p.src.length && p.src[p.pos] !== '"') advance(p, 1)
    const valTo = p.pos
    const rawValue = p.src.slice(valFrom, valTo)
    if (p.src[p.pos] !== '"') {
      error(p, `unterminated attribute value for '${name}'`, nameLine, nameCol)
      return attrs
    }
    advance(p, 1) // closing "
    attrs[name] = unescapeAttr(rawValue)
    attrRanges[name] = {
      name: { from: nameFrom, to: nameTo },
      value: { from: valFrom, to: valTo }
    }
  }
}

interface ParsedTag {
  name: string
  attrs: Record<string, string>
  selfClosing: boolean
  children: ParsedNode[]
  rawContent?: string
  startLine: number
  startCol: number
  /** Offset of the leading `<`. */
  tagStart: number
  /** Offset one past the `>` that closes the opening tag (or `/>` for self-closing). */
  openTagEnd: number
  /** Offset of the first character after the open tag's `>`. Undefined for self-closing. */
  contentStart?: number
  /** Offset of the `<` that starts the closing tag. Undefined for self-closing. */
  contentEnd?: number
  attrRanges: Record<string, AttrRange>
}

type ParsedNode = ParsedTag

function readRawContent (p: Parser, closingTag: string): string {
  const start = p.pos
  const needle = `</${closingTag}>`
  const idx = p.src.indexOf(needle, p.pos)
  if (idx === -1) {
    error(p, `missing closing tag </${closingTag}>`)
    advance(p, p.src.length - p.pos)
    return p.src.slice(start)
  }
  advance(p, idx - p.pos)
  return p.src.slice(start, idx)
}

function parseTag (p: Parser, allowRawContentFor?: Set<string>): ParsedTag | null {
  const startLine = p.line
  const startCol = p.col
  const tagStart = p.pos
  if (p.src[p.pos] !== '<') {
    error(p, 'expected \'<\'', startLine, startCol)
    advance(p, 1)
    return null
  }
  advance(p, 1)
  if (p.src[p.pos] === '/') {
    error(p, 'unexpected closing tag', startLine, startCol)
    // consume until next >
    while (p.pos < p.src.length && p.src[p.pos] !== '>') advance(p, 1)
    if (p.src[p.pos] === '>') advance(p, 1)
    return null
  }
  const name = parseIdent(p)
  if (!name) {
    error(p, 'expected tag name after \'<\'', startLine, startCol)
    return null
  }
  const attrRanges: Record<string, AttrRange> = {}
  const attrs = parseAttributes(p, attrRanges)
  skipWhitespace(p)
  let selfClosing = false
  if (p.src[p.pos] === '/') {
    advance(p, 1)
    if (p.src[p.pos] !== '>') {
      error(p, `expected '>' after '/' in <${name}>`, p.line, p.col)
    } else {
      advance(p, 1)
    }
    selfClosing = true
    const openTagEnd = p.pos
    return { name, attrs, selfClosing, children: [], startLine, startCol, tagStart, openTagEnd, attrRanges }
  }
  if (p.src[p.pos] !== '>') {
    error(p, `expected '>' to close opening tag <${name}>`, p.line, p.col)
    const openTagEnd = p.pos
    return { name, attrs, selfClosing: true, children: [], startLine, startCol, tagStart, openTagEnd, attrRanges }
  }
  advance(p, 1) // >
  const openTagEnd = p.pos

  const tag: ParsedTag = { name, attrs, selfClosing: false, children: [], startLine, startCol, tagStart, openTagEnd, attrRanges }

  if (allowRawContentFor && allowRawContentFor.has(name)) {
    const contentStart = p.pos
    tag.rawContent = readRawContent(p, name)
    tag.contentStart = contentStart
    tag.contentEnd = p.pos
    // consume closing tag
    if (p.src.startsWith(`</${name}>`, p.pos)) advance(p, `</${name}>`.length)
    return tag
  }

  const contentStart = p.pos
  // parse children until </name>
  for (;;) {
    skipWhitespace(p)
    if (p.pos >= p.src.length) {
      error(p, `missing closing tag </${name}>`, startLine, startCol)
      tag.contentStart = contentStart
      tag.contentEnd = p.pos
      break
    }
    if (p.src.startsWith(`</${name}>`, p.pos)) {
      tag.contentStart = contentStart
      tag.contentEnd = p.pos
      advance(p, `</${name}>`.length)
      break
    }
    if (p.src[p.pos] !== '<') {
      error(p, `unexpected text content in <${name}>`, p.line, p.col)
      // consume until < or end
      while (p.pos < p.src.length && p.src[p.pos] !== '<') advance(p, 1)
      continue
    }
    const child = parseTag(p, allowRawContentFor)
    if (child) tag.children.push(child)
  }
  return tag
}

function coerceAttr (raw: string, attr: AttributeDescriptor, tag: ParsedTag, p: Parser): any {
  switch (attr.type) {
    case 'boolean':
      if (raw === 'true') return true
      if (raw === 'false') return false
      error(p, `attribute '${attr.name}' on <${tag.name}> expects boolean, got '${raw}'`, tag.startLine, tag.startCol)
      return raw
    case 'number': {
      const n = Number(raw)
      if (Number.isNaN(n)) {
        error(p, `attribute '${attr.name}' on <${tag.name}> expects number, got '${raw}'`, tag.startLine, tag.startCol)
        return raw
      }
      return n
    }
    case 'integer': {
      const n = Number(raw)
      if (!Number.isInteger(n)) {
        error(p, `attribute '${attr.name}' on <${tag.name}> expects integer, got '${raw}'`, tag.startLine, tag.startCol)
        return raw
      }
      return n
    }
    case 'string-array': {
      const items = raw === '' ? [] : raw.split(',').map(s => s.trim())
      if (attr.enumValues) {
        for (const item of items) {
          if (!attr.enumValues.includes(item)) {
            error(
              p,
              `attribute '${attr.name}' on <${tag.name}> has item '${item}' not in enum [${attr.enumValues.join(', ')}]`,
              tag.startLine,
              tag.startCol
            )
          }
        }
      }
      return items
    }
    case 'string':
    default:
      if (attr.enumValues && !attr.enumValues.includes(raw)) {
        error(
          p,
          `attribute '${attr.name}' on <${tag.name}> has value '${raw}' not in enum [${attr.enumValues.join(', ')}]`,
          tag.startLine,
          tag.startCol
        )
      }
      return raw
  }
}

function setAt (target: any, path: string[], value: unknown): void {
  let cur = target
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i]
    if (cur[seg] == null || typeof cur[seg] !== 'object') cur[seg] = {}
    cur = cur[seg]
  }
  cur[path[path.length - 1]] = value
}

function applyAttributes (
  tag: ParsedTag,
  target: Record<string, any>,
  attrs: AttributeDescriptor[],
  p: Parser
): void {
  const byName = new Map(attrs.map(a => [a.name, a]))
  for (const [name, rawValue] of Object.entries(tag.attrs)) {
    const attr = byName.get(name)
    if (!attr) {
      error(p, `unknown attribute '${name}' on <${tag.name}>`, tag.startLine, tag.startCol)
      continue
    }
    setAt(target, attr.jsonPath, coerceAttr(rawValue, attr, tag, p))
  }
}

function buildElement (tag: ParsedTag, p: Parser): any | null {
  const descriptor: TagDescriptor | undefined = tagDescriptors[tag.name]
  if (!descriptor) {
    error(p, `unknown element <${tag.name}>`, tag.startLine, tag.startCol)
    return null
  }
  const result: Record<string, any> = { type: tag.name }
  applyAttributes(tag, result, descriptor.attributes, p)

  if (descriptor.contentProperty) {
    if (tag.rawContent !== undefined) {
      const trimmed = unescapeContent(tag.rawContent).trim()
      if (trimmed !== '') result[descriptor.contentProperty] = trimmed
    } else if (tag.children.length > 0) {
      error(p, `<${tag.name}> expects raw text content, not nested tags`, tag.startLine, tag.startCol)
    }
    // self-closing or empty content: leave contentProperty unset (schema default applies)
    return result
  }

  if (descriptor.childrenSlots.length === 0) return result

  // Group children by slot
  const slotsByVirtualTag = new Map<string, ChildrenSlot>()
  let directSlot: ChildrenSlot | null = null
  for (const slot of descriptor.childrenSlots) {
    if (slot.virtualTag) slotsByVirtualTag.set(slot.virtualTag, slot)
    else directSlot = slot
  }

  for (const child of tag.children) {
    const virtualSlot = slotsByVirtualTag.get(child.name)
    if (virtualSlot) {
      const list = (result[virtualSlot.property] ??= [])
      if (virtualSlot.kind === 'direct') {
        // children of this virtual wrapper are page elements
        for (const grandchild of child.children) {
          const el = buildElement(grandchild, p)
          if (el) list.push(el)
        }
      } else if (virtualSlot.kind === 'structured') {
        const item: Record<string, any> = {}
        applyAttributes(child, item, virtualSlot.itemAttributes ?? [], p)
        item.children = []
        for (const grandchild of child.children) {
          const el = buildElement(grandchild, p)
          if (el) item.children.push(el)
        }
        list.push(item)
      } else {
        // link
        const item: Record<string, any> = {}
        applyAttributes(child, item, virtualSlot.itemAttributes ?? [], p)
        if (child.children.length > 0) {
          error(p, `<${child.name}> must be self-closing`, child.startLine, child.startCol)
        }
        list.push(item)
      }
      continue
    }
    if (directSlot) {
      const list = (result[directSlot.property] ??= [])
      const el = buildElement(child, p)
      if (el) list.push(el)
      continue
    }
    error(
      p,
      `<${child.name}> is not a valid child of <${tag.name}>`,
      child.startLine,
      child.startCol
    )
  }

  return result
}

function contentPropertyTags (): Set<string> {
  const out = new Set<string>()
  for (const [name, desc] of Object.entries(tagDescriptors)) {
    if (desc.contentProperty) out.add(name)
  }
  return out
}

function newSourceMap (): MarkupSourceMap {
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

function populateElementSourceMap (tag: ParsedTag, pointer: string, sourceMap: MarkupSourceMap): void {
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
        // Virtual wrapper has no JSON correspondence; each grandchild is an element.
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

/**
 * Parse markup text into a page-elements array.
 *
 * Returns `{ elements, errors, sourceMap }`. When `errors.length > 0`,
 * `elements` is `null` and callers must leave underlying data untouched, but
 * `sourceMap` is still populated on a best-effort basis for whatever parsed.
 */
export function deserializeElements (src: string): DeserializeResult {
  const p = makeParser(src)
  const rawTags = contentPropertyTags()
  const roots: ParsedTag[] = []
  for (;;) {
    skipWhitespace(p)
    if (p.pos >= p.src.length) break
    if (p.src[p.pos] !== '<') {
      error(p, `unexpected character '${p.src[p.pos]}' at top level`, p.line, p.col)
      // recover: skip to next '<'
      while (p.pos < p.src.length && p.src[p.pos] !== '<') advance(p, 1)
      continue
    }
    const tag = parseTag(p, rawTags)
    if (tag) roots.push(tag)
  }

  const sourceMap = newSourceMap()
  for (let i = 0; i < roots.length; i++) {
    populateElementSourceMap(roots[i], `/${i}`, sourceMap)
  }

  if (p.errors.length > 0) return { elements: null, errors: p.errors, sourceMap }

  const elements: any[] = []
  for (const tag of roots) {
    const el = buildElement(tag, p)
    if (el) elements.push(el)
  }
  if (p.errors.length > 0) return { elements: null, errors: p.errors, sourceMap }
  healUuids(elements)
  return { elements, errors: [], sourceMap }
}
