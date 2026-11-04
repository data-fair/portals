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
 * The layout expressions of the forms read the form context (page type, pages to link to, owner...),
 * which an editor tool group cannot pass: its values are written into them instead, so that no
 * expression throws on a missing context. Each value is a parenthesized JSON literal.
 */
export const bakeContext = (schema: JsonSchema, context: Record<string, unknown>): JsonSchema => {
  const keys = Object.keys(context)
  if (!keys.length) return structuredClone(schema)
  const pattern = new RegExp(`(?<![\\w.])(?:options\\.)?context\\.(${keys.join('|')})\\b`, 'g')
  const bake = (value: string) => value.replace(pattern, (_match, key: string) => `(${JSON.stringify(context[key])})`)
  return JSON.parse(JSON.stringify(schema), (_key, value) => typeof value === 'string' ? bake(value) : value)
}

// an editor session is never in admin mode nor embedded, and has no list of pages to link to
const pagesContext = { pages: { generic: [], event: [], news: [] }, adminMode: false }

export const pageConfigContext = (pageType: string) => ({ ...pagesContext, pageType })

export const portalConfigContext = (portal: { owner: Record<string, unknown>, whiteLabel?: boolean }) => ({
  ...pagesContext,
  owner: portal.owner,
  whiteLabel: !!portal.whiteLabel,
  // as the portal editor: the theme form without the advanced font and logo settings
  simplifiedTheme: true
})
