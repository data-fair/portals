// Build-time script: compile `shared/markup/codemirror/portal-markup.grammar`
// into a committed TypeScript parser module via @lezer/generator.
//
// Mirrors the pattern used by `generate-descriptors.ts`: the output is checked
// in so the runtime doesn't carry `@lezer/generator` as a dependency.

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildParserFile } from '@lezer/generator'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const grammarPath = join(root, 'shared/markup/codemirror/portal-markup.grammar')
const outParser = join(root, 'shared/markup/codemirror/portal-markup.grammar.ts')
const outTerms = join(root, 'shared/markup/codemirror/portal-markup.grammar.terms.ts')

const grammarText = readFileSync(grammarPath, 'utf8')
const { parser, terms } = buildParserFile(grammarText, {
  fileName: grammarPath,
  moduleStyle: 'es',
  typeScript: true
})

const header = '// GENERATED FILE — DO NOT EDIT\n// Regenerate with: npx tsx build/markup/generate-grammar.ts\n\n'
writeFileSync(outParser, header + parser, 'utf8')
writeFileSync(outTerms, header + terms, 'utf8')

console.log(`wrote ${outParser}`)
console.log(`wrote ${outTerms}`)
