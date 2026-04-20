/**
 * Public entry point for parsing portal markup. Orchestrates three passes:
 *  1. Syntactic parse (`parse.ts`)      → `ParsedTag` tree + parser errors
 *  2. Source-map population (`source-map.ts`) → JSON pointer ↔ char range
 *  3. Semantic binding (this file)      → JSON page-element tree
 *
 * Pass 3 walks the parsed tree alongside the generated `tagDescriptors` to
 * produce a page-elements JSON array, coercing attribute values to their
 * declared scalar type and unwrapping virtual slot tags (`<tab>`, `<panel>`,
 * `<action>`, ...) into their target array properties.
 *
 * The source map is always returned, even on failure — downstream widgets
 * use whatever ranges were parsed to keep the editor usable mid-edit.
 */
import type { AttributeDescriptor, ChildrenSlot, MarkupSourceMap, TagDescriptor } from './types.ts'
import { tagDescriptors } from './tag-descriptors.ts'
import { walkElements } from './walker.ts'
import {
  makeParser,
  parseRootTags,
  reportError,
  unescapeContent,
  type DeserializeError,
  type Parser,
  type ParsedTag
} from './parse.ts'
import { newSourceMap, populateElementSourceMap } from './source-map.ts'

export type { DeserializeError } from './parse.ts'

/** Element types that require a stable uuid (currently iframe-hosting elements). */
const UUID_TYPES = new Set(['application', 'dataset-table'])

function newShortUuid (): string {
  return globalThis.crypto.randomUUID().split('-')[0]
}

/**
 * Fill missing uuids and regenerate duplicates for element types that depend
 * on uuid uniqueness. Runs after a successful parse so copy-pasted markup
 * yields elements with distinct uuids.
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

function coerceAttr (raw: string, attr: AttributeDescriptor, tag: ParsedTag, p: Parser): any {
  switch (attr.type) {
    case 'boolean':
      if (raw === 'true') return true
      if (raw === 'false') return false
      reportError(p, `attribute '${attr.name}' on <${tag.name}> expects boolean, got '${raw}'`, tag.startLine, tag.startCol)
      return raw
    case 'number': {
      const n = Number(raw)
      if (Number.isNaN(n)) {
        reportError(p, `attribute '${attr.name}' on <${tag.name}> expects number, got '${raw}'`, tag.startLine, tag.startCol)
        return raw
      }
      return n
    }
    case 'integer': {
      const n = Number(raw)
      if (!Number.isInteger(n)) {
        reportError(p, `attribute '${attr.name}' on <${tag.name}> expects integer, got '${raw}'`, tag.startLine, tag.startCol)
        return raw
      }
      return n
    }
    case 'string-array': {
      const items = raw === '' ? [] : raw.split(',').map(s => s.trim())
      if (attr.enumValues) {
        for (const item of items) {
          if (!attr.enumValues.includes(item)) {
            reportError(
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
        reportError(
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

const attrsByNameCache = new WeakMap<AttributeDescriptor[], Map<string, AttributeDescriptor>>()
function attrsByName (attrs: AttributeDescriptor[]): Map<string, AttributeDescriptor> {
  let cached = attrsByNameCache.get(attrs)
  if (!cached) {
    cached = new Map(attrs.map(a => [a.name, a]))
    attrsByNameCache.set(attrs, cached)
  }
  return cached
}

function applyAttributes (
  tag: ParsedTag,
  target: Record<string, any>,
  attrs: AttributeDescriptor[],
  p: Parser
): void {
  const byName = attrsByName(attrs)
  for (const [name, rawValue] of Object.entries(tag.attrs)) {
    const attr = byName.get(name)
    if (!attr) {
      reportError(p, `unknown attribute '${name}' on <${tag.name}>`, tag.startLine, tag.startCol)
      continue
    }
    setAt(target, attr.jsonPath, coerceAttr(rawValue, attr, tag, p))
  }
}

/**
 * Convert a parsed tag into a page-element JSON object, recursing through
 * children according to the descriptor's `childrenSlots`. Virtual slot tags
 * are unwrapped into their target array property; invalid nestings are
 * reported as errors.
 */
function buildElement (tag: ParsedTag, p: Parser): any | null {
  const descriptor: TagDescriptor | undefined = tagDescriptors[tag.name]
  if (!descriptor) {
    reportError(p, `unknown element <${tag.name}>`, tag.startLine, tag.startCol)
    return null
  }
  const result: Record<string, any> = { type: tag.name }
  applyAttributes(tag, result, descriptor.attributes, p)

  if (descriptor.contentProperty) {
    if (tag.rawContent !== undefined) {
      const trimmed = unescapeContent(tag.rawContent).trim()
      if (trimmed !== '') result[descriptor.contentProperty] = trimmed
    } else if (tag.children.length > 0) {
      reportError(p, `<${tag.name}> expects raw text content, not nested tags`, tag.startLine, tag.startCol)
    }
    return result
  }

  if (descriptor.childrenSlots.length === 0) return result

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
          reportError(p, `<${child.name}> must be self-closing`, child.startLine, child.startCol)
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
    reportError(
      p,
      `<${child.name}> is not a valid child of <${tag.name}>`,
      child.startLine,
      child.startCol
    )
  }

  return result
}

const CONTENT_PROPERTY_TAGS: Set<string> = new Set(
  Object.entries(tagDescriptors).filter(([, d]) => d.contentProperty).map(([name]) => name)
)

/**
 * Parse markup text into a page-elements array.
 *
 * Returns `{ elements, errors, sourceMap }`. When `errors.length > 0`,
 * `elements` is `null` and callers must leave underlying data untouched, but
 * `sourceMap` is still populated on a best-effort basis for whatever parsed.
 */
export function deserializeElements (src: string): DeserializeResult {
  const parser = makeParser(src)
  const roots = parseRootTags(parser, CONTENT_PROPERTY_TAGS)

  const sourceMap = newSourceMap()
  for (let i = 0; i < roots.length; i++) {
    populateElementSourceMap(roots[i], `/${i}`, sourceMap)
  }

  if (parser.errors.length > 0) return { elements: null, errors: parser.errors, sourceMap }

  const elements: any[] = []
  for (const tag of roots) {
    const el = buildElement(tag, parser)
    if (el) elements.push(el)
  }
  if (parser.errors.length > 0) return { elements: null, errors: parser.errors, sourceMap }
  healUuids(elements)
  return { elements, errors: [], sourceMap }
}
