/**
 * Schema analyzer for the page element markup language.
 *
 * Walks a pre-resolved JSON Schema (produced by makeLocalDefs) for page elements
 * and produces TagDescriptor objects that drive serialization, deserialization,
 * validation, and CodeMirror language support.
 */

import type { TagDescriptor, ChildrenSlot, AttributeDescriptor } from '../../shared/markup/types.ts'

const ELEMENT_REF = '#/$defs/element'
const LINK_ITEM_REFS = new Set([
  '#/$defs/linkItem',
  '#/$defs/simpleLinkItem'
])

const VIRTUAL_TAG_NAMES: Record<string, string> = {
  advancedFilters: 'filters',
  actions: 'action',
  links: 'link',
  tabs: 'tab',
  panels: 'panel'
}

type Schema = Record<string, any>

// ---------------------------------------------------------------------------
// Title extraction
// ---------------------------------------------------------------------------

function extractTitles (schema: Schema): Record<string, string> | undefined {
  const out: Record<string, string> = {}
  if (typeof schema.title === 'string' && schema.title !== '') out.en = schema.title
  const i18n = schema['x-i18n-title']
  if (i18n && typeof i18n === 'object') {
    for (const [loc, value] of Object.entries(i18n as Record<string, unknown>)) {
      if (typeof value === 'string' && value !== '') out[loc] = value
    }
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function extractEnumTitles (schema: Schema): Record<string, Record<string, string>> | undefined {
  const source = schema.type === 'array' ? schema.items : schema
  if (!source?.oneOf) return undefined
  const out: Record<string, Record<string, string>> = {}
  for (const branch of source.oneOf) {
    if (branch.const === undefined) continue
    const titles = extractTitles(branch)
    if (titles) out[String(branch.const)] = titles
  }
  return Object.keys(out).length > 0 ? out : undefined
}

// ---------------------------------------------------------------------------
// Ref resolution helpers (all refs are internal #/$defs/... after makeLocalDefs)
// ---------------------------------------------------------------------------

function resolveRef (rootSchema: Schema, ref: string): Schema {
  if (!ref.startsWith('#/$defs/')) {
    throw new Error(`Unexpected ref format: "${ref}" — expected #/$defs/...`)
  }
  const defName = ref.slice('#/$defs/'.length)
  const resolved = rootSchema.$defs?.[defName]
  if (!resolved) throw new Error(`Definition not found: ${defName}`)
  return resolved
}

function resolveProperty (rootSchema: Schema, propSchema: Schema): Schema {
  if (!propSchema.$ref) return propSchema
  const resolved = resolveRef(rootSchema, propSchema.$ref)
  const { $ref, ...overrides } = propSchema
  if (Object.keys(overrides).length > 0) {
    return { ...resolved, ...overrides }
  }
  return resolved
}

// ---------------------------------------------------------------------------
// Main analysis entry point
// ---------------------------------------------------------------------------

export function analyzeSchemas (schema: Schema): Record<string, TagDescriptor> {
  const oneOf = schema.$defs.element.oneOf as Schema[]
  const result: Record<string, TagDescriptor> = {}

  for (const variant of oneOf) {
    if (!variant.$ref) continue
    const elementSchema = resolveRef(schema, variant.$ref)
    const descriptor = analyzeElement(elementSchema, schema)
    result[descriptor.tagName] = descriptor
  }

  return result
}

// ---------------------------------------------------------------------------
// Element analysis
// ---------------------------------------------------------------------------

function analyzeElement (elementSchema: Schema, rootSchema: Schema): TagDescriptor {
  const properties: Record<string, Schema> = elementSchema.properties || {}
  const requiredSet = new Set<string>(elementSchema.required || [])

  const tagName = properties.type?.const
  if (!tagName) throw new Error(`Element schema missing type.const: ${JSON.stringify(elementSchema).slice(0, 100)}`)

  const hasBothChildrenSlots = 'children' in properties && 'children2' in properties
  const layoutOrder = extractLayoutOrder(elementSchema.layout)

  const hiddenProperties: string[] = []
  const childrenSlots: ChildrenSlot[] = []
  const attributes: AttributeDescriptor[] = []
  let contentProperty: string | null = null

  for (const [propName, rawPropSchema] of Object.entries(properties)) {
    if (propName === 'type') continue

    const propSchema = resolveProperty(rootSchema, rawPropSchema)

    // --- Hidden properties ---
    if (isHidden(propName, propSchema)) {
      hiddenProperties.push(propName)
      continue
    }

    // --- Children containers ---
    const childrenSlot = classifyAsChildrenSlot(propName, rawPropSchema, propSchema, hasBothChildrenSlots, rootSchema)
    if (childrenSlot) {
      childrenSlots.push(childrenSlot)
      continue
    }

    // --- Content property ---
    if (propName === 'content' && getSchemaType(propSchema) === 'string') {
      contentProperty = 'content'
      continue
    }

    // --- Object attributes (flatten with dot notation) ---
    if (isObjectSchema(propSchema)) {
      attributes.push(...flattenObjectAttributes(propName, [propName], propSchema, requiredSet.has(propName), rootSchema))
      continue
    }

    // --- Simple attributes ---
    const attr = makeAttributeDescriptor(propName, [propName], propSchema, requiredSet.has(propName))
    if (attr) attributes.push(attr)
  }

  sortAttributes(attributes, layoutOrder)

  const descriptor: TagDescriptor = { tagName, contentProperty, childrenSlots, attributes, hiddenProperties }
  const titles = extractTitles(elementSchema)
  if (titles) descriptor.titles = titles
  return descriptor
}

// ---------------------------------------------------------------------------
// Property classification helpers
// ---------------------------------------------------------------------------

function isHidden (propName: string, propSchema: Schema): boolean {
  if (propSchema.readOnly) return true
  if (propName.endsWith('_html')) return true
  return false
}

function classifyAsChildrenSlot (
  propName: string,
  rawPropSchema: Schema,
  propSchema: Schema,
  hasBothChildrenSlots: boolean,
  rootSchema: Schema
): ChildrenSlot | null {
  if (getSchemaType(propSchema) !== 'array') return null

  const items = propSchema.items
  if (!items) return null

  const slotTitles = extractTitles(propSchema)

  // Case 1: Array of page elements (items ref to page-elements#/$defs/element)
  if (isElementRef(items)) {
    const virtualTag = getChildrenVirtualTag(propName, hasBothChildrenSlots)
    const slot: ChildrenSlot = { property: propName, virtualTag, kind: 'direct' }
    if (slotTitles) slot.titles = slotTitles
    return slot
  }

  // Case 2: Structured container — items are objects with a `children` sub-prop holding elements
  const resolvedItems = resolveProperty(rootSchema, items)
  if (resolvedItems.type === 'object' && resolvedItems.properties?.children) {
    const childrenProp = resolvedItems.properties.children
    if (childrenProp.items && isElementRef(childrenProp.items)) {
      const virtualTag = VIRTUAL_TAG_NAMES[propName] || propName
      const itemAttributes = extractItemAttributes(resolvedItems, rootSchema)
      const slot: ChildrenSlot = { property: propName, virtualTag, kind: 'structured', itemAttributes }
      if (slotTitles) slot.titles = slotTitles
      return slot
    }
  }

  // Case 3: Link item arrays (items $ref to linkItem or simpleLinkItem)
  if (items.$ref && LINK_ITEM_REFS.has(items.$ref)) {
    const virtualTag = VIRTUAL_TAG_NAMES[propName] || propName
    const linkSchema = resolveRef(rootSchema, items.$ref)
    const itemAttributes = extractLinkItemAttributes(linkSchema, rootSchema)
    const slot: ChildrenSlot = { property: propName, virtualTag, kind: 'link', itemAttributes }
    if (slotTitles) slot.titles = slotTitles
    return slot
  }

  return null
}

function isElementRef (schema: Schema): boolean {
  return schema.$ref === ELEMENT_REF
}

function getChildrenVirtualTag (propName: string, hasBothChildrenSlots: boolean): string | null {
  if (propName === 'children') return hasBothChildrenSlots ? 'left' : null
  if (propName === 'children2') return 'right'
  return VIRTUAL_TAG_NAMES[propName] || propName
}

/** Extract non-children attributes from a structured container item (tab/panel title, icon). */
function extractItemAttributes (
  itemSchema: Schema,
  rootSchema: Schema
): AttributeDescriptor[] {
  const attrs: AttributeDescriptor[] = []
  const required = new Set<string>(itemSchema.required || [])
  for (const [propName, rawPropSchema] of Object.entries((itemSchema.properties || {}) as Record<string, Schema>)) {
    if (propName === 'children') continue
    const propSchema = resolveProperty(rootSchema, rawPropSchema)
    if (isObjectSchema(propSchema)) {
      attrs.push(...flattenObjectAttributes(propName, [propName], propSchema, required.has(propName), rootSchema))
    } else {
      const attr = makeAttributeDescriptor(propName, [propName], propSchema, required.has(propName))
      if (attr) attrs.push(attr)
    }
  }
  return attrs
}

/** Extract all possible attributes from a discriminated union (linkItem / simpleLinkItem). */
function extractLinkItemAttributes (
  unionSchema: Schema,
  rootSchema: Schema
): AttributeDescriptor[] {
  const seen = new Map<string, AttributeDescriptor>()
  for (const branch of (unionSchema.oneOf || [])) {
    const branchSchema = branch.$ref
      ? resolveRef(rootSchema, branch.$ref)
      : branch
    const required = new Set<string>(branchSchema.required || [])
    for (const [propName, rawPropSchema] of Object.entries((branchSchema.properties || {}) as Record<string, Schema>)) {
      if (seen.has(propName)) continue
      const propSchema = resolveProperty(rootSchema, rawPropSchema)
      if (isObjectSchema(propSchema)) {
        for (const attr of flattenObjectAttributes(propName, [propName], propSchema, required.has(propName), rootSchema)) {
          if (!seen.has(attr.name)) seen.set(attr.name, attr)
        }
      } else {
        const attr = makeAttributeDescriptor(propName, [propName], propSchema, required.has(propName))
        if (attr) seen.set(propName, attr)
      }
    }
  }
  return [...seen.values()]
}

// ---------------------------------------------------------------------------
// Object flattening (dot notation)
// ---------------------------------------------------------------------------

function isObjectSchema (schema: Schema): boolean {
  return schema.type === 'object' || (!schema.type && schema.properties != null)
}

function flattenObjectAttributes (
  prefix: string,
  basePath: string[],
  objectSchema: Schema,
  parentRequired: boolean,
  rootSchema: Schema,
  depth = 0
): AttributeDescriptor[] {
  const attrs: AttributeDescriptor[] = []

  // For discriminated unions (oneOf with branches), collect properties from all branches
  if (objectSchema.oneOf && !objectSchema.properties) {
    const seen = new Set<string>()
    for (const branch of objectSchema.oneOf) {
      const branchSchema = branch.$ref
        ? resolveRef(rootSchema, branch.$ref)
        : branch
      const branchRequired = new Set<string>(branchSchema.required || [])
      for (const [propName, rawPropSchema] of Object.entries((branchSchema.properties || {}) as Record<string, Schema>)) {
        if (seen.has(propName)) continue
        seen.add(propName)
        const propSchema = resolveProperty(rootSchema, rawPropSchema)
        const attrName = `${prefix}.${propName}`
        const jsonPath = [...basePath, propName]
        const isReq = parentRequired && branchRequired.has(propName)
        if (isObjectSchema(propSchema) && depth < 3) {
          attrs.push(...flattenObjectAttributes(attrName, jsonPath, propSchema, isReq, rootSchema, depth + 1))
        } else {
          const attr = makeAttributeDescriptor(attrName, jsonPath, propSchema, isReq)
          if (attr) attrs.push(attr)
        }
      }
    }
    return attrs
  }

  const requiredSet = new Set<string>(objectSchema.required || [])
  const properties: Record<string, Schema> = objectSchema.properties || {}

  for (const [propName, rawPropSchema] of Object.entries(properties)) {
    const propSchema = resolveProperty(rootSchema, rawPropSchema)
    const attrName = `${prefix}.${propName}`
    const jsonPath = [...basePath, propName]
    const isReq = parentRequired && requiredSet.has(propName)

    if (isObjectSchema(propSchema) && depth < 3) {
      attrs.push(...flattenObjectAttributes(attrName, jsonPath, propSchema, isReq, rootSchema, depth + 1))
    } else {
      const attr = makeAttributeDescriptor(attrName, jsonPath, propSchema, isReq)
      if (attr) attrs.push(attr)
    }
  }
  return attrs
}

// ---------------------------------------------------------------------------
// Attribute descriptor construction
// ---------------------------------------------------------------------------

function makeAttributeDescriptor (
  name: string,
  jsonPath: string[],
  propSchema: Schema,
  required: boolean
): AttributeDescriptor | null {
  const type = getLeafType(propSchema)
  if (!type) return null

  const attr: AttributeDescriptor = { name, jsonPath, type, required }
  const enumValues = extractEnumValues(propSchema)
  if (enumValues) attr.enumValues = enumValues
  if (propSchema.default !== undefined) attr.default = propSchema.default
  const titles = extractTitles(propSchema)
  if (titles) attr.titles = titles
  const enumTitles = extractEnumTitles(propSchema)
  if (enumTitles) attr.enumTitles = enumTitles

  return attr
}

function getSchemaType (schema: Schema): string | undefined {
  if (schema.type) return schema.type
  if (schema.const !== undefined) return typeof schema.const
  if (schema.properties) return 'object'
  return undefined
}

function getLeafType (schema: Schema): 'string' | 'number' | 'integer' | 'boolean' | 'string-array' | null {
  const t = getSchemaType(schema)
  if (t === 'string') return 'string'
  if (t === 'number') return 'number'
  if (t === 'integer') return 'integer'
  if (t === 'boolean') return 'boolean'
  if (schema.const !== undefined) {
    if (typeof schema.const === 'string') return 'string'
    if (typeof schema.const === 'number') return Number.isInteger(schema.const) ? 'integer' : 'number'
    if (typeof schema.const === 'boolean') return 'boolean'
  }
  if (schema.oneOf) {
    for (const branch of schema.oneOf) {
      if (branch.const !== undefined) {
        if (typeof branch.const === 'string') return 'string'
        if (typeof branch.const === 'number') return Number.isInteger(branch.const) ? 'integer' : 'number'
      }
    }
  }
  // Arrays of strings — comma-separated in markup
  if (t === 'array' && schema.items?.type === 'string') return 'string-array'
  return null
}

function extractEnumValues (schema: Schema): (string | number)[] | undefined {
  // For string-array, enums live on the items schema, not the outer one.
  const source = schema.type === 'array' ? schema.items : schema
  if (!source?.oneOf) return undefined
  const values: (string | number)[] = []
  for (const branch of source.oneOf) {
    if (branch.const !== undefined) values.push(branch.const)
  }
  return values.length > 0 ? values : undefined
}

// ---------------------------------------------------------------------------
// Layout order extraction
// ---------------------------------------------------------------------------

function extractLayoutOrder (layout: any): string[] {
  if (!layout) return []
  return flattenLayoutChildren(layout)
}

function flattenLayoutChildren (node: any): string[] {
  if (typeof node === 'string') return [node]
  if (Array.isArray(node)) return node.flatMap(flattenLayoutChildren)
  if (node && typeof node === 'object') {
    if (node.children) return (node.children as any[]).flatMap(flattenLayoutChildren)
    if (node.key) return [node.key]
    if (node.switch) return (node.switch as any[]).flatMap(flattenLayoutChildren)
  }
  return []
}

function sortAttributes (attributes: AttributeDescriptor[], layoutOrder: string[]): void {
  if (layoutOrder.length === 0 && attributes.length === 0) return

  const orderMap = new Map<string, number>()
  orderMap.set('uuid', -1)

  let idx = 0
  for (const name of layoutOrder) {
    if (name !== 'type' && name !== 'uuid') {
      orderMap.set(name, idx++)
    }
  }

  attributes.sort((a, b) => {
    const rootA = a.jsonPath[0]
    const rootB = b.jsonPath[0]
    const orderA = orderMap.get(rootA) ?? 999
    const orderB = orderMap.get(rootB) ?? 999
    if (orderA !== orderB) return orderA - orderB
    return a.name.localeCompare(b.name)
  })
}
