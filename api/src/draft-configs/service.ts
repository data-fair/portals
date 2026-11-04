import { readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import themeSchema from '@data-fair/lib-common-types/theme/schema.js'
import { bundleSchema, bakePageType } from './operations.ts'

const typesDir = resolve(import.meta.dirname, '../../types')

// every schema of api/types and the lib schemas they reference, by $id
let schemasPromise: Promise<Record<string, Record<string, any>>> | undefined
const typeSchemas = () => {
  schemasPromise ??= (async () => {
    const schemas: Record<string, Record<string, any>> = { [themeSchema.$id]: themeSchema }
    for (const dir of await readdir(typesDir, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue
      const file = ['schema.js', 'schema.ts'].map(f => resolve(typesDir, dir.name, f)).find(f => existsSync(f))
      if (!file) continue
      const schema = (await import(file)).default
      if (schema?.$id) schemas[schema.$id] = schema
    }
    return schemas
  })()
  return schemasPromise
}

const pageConfigSchemas: Record<string, Promise<Record<string, any>>> = {}

// the form of the page editors that an assistant can navigate (nested blocks reachable through the
// form), for a page type
export const pageConfigSchema = (pageType: string) => {
  pageConfigSchemas[pageType] ??= typeSchemas().then(schemas => {
    return bakePageType(bundleSchema(schemas['https://github.com/data-fair/portals/page-config-simple'], schemas), pageType)
  })
  return pageConfigSchemas[pageType]
}

let portalConfigSchemaPromise: Promise<Record<string, any>> | undefined
export const portalConfigSchema = () => {
  portalConfigSchemaPromise ??= typeSchemas().then(schemas => bundleSchema(schemas['https://github.com/data-fair/portals/portal-config'], schemas))
  return portalConfigSchemaPromise
}
