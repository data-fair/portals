/**
 * Build-time script that generates tag descriptors from the page element JSON Schemas.
 *
 * Usage: node --import tsx build/markup/generate-descriptors.ts
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// @ts-ignore — lib-utils is a JS module without type declarations
import { makeLocalDefs } from '@data-fair/lib-utils/json-schema.js'
import { analyzeSchemas } from './schema-analyzer.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')

// ---------------------------------------------------------------------------
// Load all schema files and build a map keyed by $id
// ---------------------------------------------------------------------------

const PAGE_ELEMENTS_ID = 'https://github.com/data-fair/portals/page-elements'

async function loadSchemas (): Promise<Record<string, any>> {
  const schemasById: Record<string, any> = {}

  const schemaFiles = [
    'api/types/common-defs/schema.js',
    'api/types/common-links/schema.js',
    'api/types/page-element-defs/schema.js',
    'api/types/page-elements/schema.js',
    'api/types/page-element-basics/schema.js',
    'api/types/page-element-navigation/schema.js',
    'api/types/page-element-layout/schema.js',
    'api/types/page-element-functional/schema.js',
    'api/types/page-element-datasets/schema.js',
    'api/types/page-element-applications/schema.js',
    'api/types/page-element-reuses/schema.js',
    'api/types/page-element-events/schema.js',
    'api/types/page-element-news/schema.js',
    'api/types/common-dataset-card/schema.js',
    'api/types/common-application-card/schema.js',
    'api/types/common-reuse-card/schema.js',
    'api/types/common-event-card/schema.js',
    'api/types/common-news-card/schema.js'
  ]

  for (const file of schemaFiles) {
    const mod = await import(resolve(ROOT, file))
    const schema = mod.default
    if (schema.$id) schemasById[schema.$id] = schema
  }

  return schemasById
}

// ---------------------------------------------------------------------------
// Generate output
// ---------------------------------------------------------------------------

async function main () {
  const schemasById = await loadSchemas()
  const schema = makeLocalDefs(schemasById, PAGE_ELEMENTS_ID)

  const descriptors = analyzeSchemas(schema)
  const tagCount = Object.keys(descriptors).length

  // Write the generated TypeScript file
  const outputPath = resolve(ROOT, 'shared/markup/tag-descriptors.ts')
  const content = `// GENERATED FILE — DO NOT EDIT
// Run "node --import tsx build/markup/generate-descriptors.ts" to regenerate.

import type { TagDescriptor } from './types.ts'

export const tagDescriptors: Record<string, TagDescriptor> = ${JSON.stringify(descriptors, null, 2)}
`

  writeFileSync(outputPath, content, 'utf-8')
  console.log(`Generated ${outputPath} with ${tagCount} element descriptors`)

  // Print a summary
  for (const [tagName, desc] of Object.entries(descriptors)) {
    const parts = [
      `${desc.attributes.length} attrs`,
      desc.contentProperty ? 'content' : null,
      desc.childrenSlots.length > 0 ? `${desc.childrenSlots.length} slots` : null,
      desc.hiddenProperties.length > 0 ? `${desc.hiddenProperties.length} hidden` : null
    ].filter(Boolean)
    console.log(`  ${tagName}: ${parts.join(', ')}`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
