// The JSON Schemas of the draft config editors (openapi-mcp editor tool groups): json-layout
// compiles them without any other schema registered, so every schema they reference is bundled in.

type JsonSchema = Record<string, any>

// properties that only drive the build of a type (types-builder) or register it by id
const embeddedOmitted = ['$id', '$schema', 'x-exports', 'x-jstt', 'x-ajv', 'x-vjsf', 'x-vjsf-locales']

const defKey = (id: string) => id.split('/').pop() as string

/**
 * A copy of root with every schema it references (by $id, transitively) embedded in its $defs under
 * the last segment of their id, and every $ref rewritten to a local pointer (#/$defs/<name>/...).
 * Refs are rewritten, not resolved: the recursive element definitions stay small.
 */
export const bundleSchema = (root: JsonSchema, schemas: Record<string, JsonSchema>): JsonSchema => {
  const rootId: string = root.$id
  const bundled = structuredClone(root)
  bundled.$defs = { ...bundled.$defs }
  const defs: JsonSchema = bundled.$defs
  const embedded = new Set<string>()

  const rewrite = (node: any, baseId: string) => {
    if (Array.isArray(node)) {
      for (const item of node) rewrite(item, baseId)
      return
    }
    if (!node || typeof node !== 'object') return
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string') node.$ref = localRef(value, baseId)
      else rewrite(value, baseId)
    }
  }

  const localRef = (ref: string, baseId: string) => {
    const [refId, pointer = ''] = ref.split('#')
    const id = refId || baseId
    if (id === rootId) return '#' + pointer
    embed(id)
    return `#/$defs/${defKey(id)}${pointer}`
  }

  const embed = (id: string) => {
    if (embedded.has(id)) return
    const schema = schemas[id]
    if (!schema) throw new Error(`schema ${id} not found`)
    const key = defKey(id)
    if (key in defs) throw new Error(`$defs/${key} of ${rootId} is already taken, cannot embed ${id}`)
    embedded.add(id)
    const copy = structuredClone(schema)
    for (const omitted of embeddedOmitted) delete copy[omitted]
    defs[key] = copy
    rewrite(copy, id)
  }

  // the root's own definitions first: the embedded schemas are rewritten as they are added
  const { $defs, ...rest } = bundled
  rewrite($defs, rootId)
  rewrite(rest, rootId)
  return { ...rest, $defs }
}

/**
 * The layout expressions of the page config read the page type from the form context, which an
 * editor tool group cannot pass: the type is written into them instead.
 */
export const bakePageType = (schema: JsonSchema, pageType: string): JsonSchema => {
  const literal = JSON.stringify(pageType)
  return JSON.parse(JSON.stringify(schema), (key, value) => typeof value === 'string' ? value.replace(/(?<![\w.])(options\.)?context\.pageType\b/g, literal) : value)
}
