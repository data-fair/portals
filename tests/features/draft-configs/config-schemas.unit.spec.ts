import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { compile } from '@json-layout/core'
import { bundleSchema, bakePageType } from '../../../api/src/draft-configs/operations.ts'
import { pageConfigSchema, portalConfigSchema } from '../../../api/src/draft-configs/service.ts'

const refsOf = (node: any, refs: string[] = []): string[] => {
  if (Array.isArray(node)) for (const item of node) refsOf(item, refs)
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string') refs.push(value)
      else refsOf(value, refs)
    }
  }
  return refs
}

// compiles as @json-layout/agents does, without the vjsf markdown plugin: its fields fall back to
// the default text component, the only messages json-layout may log
const compileQuietly = (schema: object) => {
  const errors: unknown[] = []
  const error = console.error
  console.error = (_message: string, details: Record<string, string[]>) => errors.push(...Object.values(details).flat())
  try {
    return compile(schema)
  } finally {
    console.error = error
    for (const message of new Set(errors)) assert.match(String(message), /unknown component "markdown"|use default component/)
  }
}

test.describe('editor config schemas', () => {
  test('bundleSchema embeds the referenced schemas in $defs and makes every ref local', () => {
    const root = {
      $id: 'https://example.com/root',
      type: 'object',
      properties: {
        a: { $ref: 'https://example.com/a#/$defs/x' },
        self: { $ref: 'https://example.com/root#/$defs/own' }
      },
      $defs: { own: { type: 'string' } }
    }
    const a = { $id: 'https://example.com/a', 'x-exports': ['types'], $defs: { x: { $ref: '#/$defs/y' }, y: { $ref: 'https://example.com/b' } } }
    const b = { $id: 'https://example.com/b', type: 'number' }
    const bundled: any = bundleSchema(root, { [a.$id]: a, [b.$id]: b })
    assert.equal(bundled.properties.a.$ref, '#/$defs/a/$defs/x')
    assert.equal(bundled.properties.self.$ref, '#/$defs/own')
    assert.equal(bundled.$defs.a.$defs.x.$ref, '#/$defs/a/$defs/y')
    assert.equal(bundled.$defs.a.$defs.y.$ref, '#/$defs/b')
    assert.deepEqual(bundled.$defs.b, { type: 'number' })
    assert.equal(bundled.$defs.a.$id, undefined)
    // the inputs are left as they were
    assert.equal(root.properties.a.$ref, 'https://example.com/a#/$defs/x')
  })

  test('bundleSchema refuses an unknown schema', () => {
    assert.throws(() => bundleSchema({ $id: 'https://example.com/root', $ref: 'https://example.com/missing' }, {}), /missing/)
  })

  test('bakePageType writes the page type into the layout expressions', () => {
    const baked: any = bakePageType({ properties: { a: { layout: { if: 'context.pageType === "event"' } }, b: { layout: { if: 'options.context.pageType !== "home"' } } } }, 'event')
    assert.equal(baked.properties.a.layout.if, '"event" === "event"')
    assert.equal(baked.properties.b.layout.if, '"event" !== "home"')
  })

  test('the page config schema is self-contained and compiles with json-layout', async () => {
    test.slow()
    const schema: any = await pageConfigSchema('event')
    assert.ok(refsOf(schema).every(ref => ref.startsWith('#')), 'every ref is local')
    assert.ok(!JSON.stringify(schema).includes('context.pageType'))
    assert.ok(schema.properties.elements)
    const compiled = compileQuietly(schema)
    assert.ok(compiled.skeletonTrees[compiled.mainTree])
  })

  test('the portal config schema is self-contained and compiles with json-layout', async () => {
    test.slow()
    const schema: any = await portalConfigSchema()
    assert.ok(refsOf(schema).every(ref => ref.startsWith('#')), 'every ref is local')
    const compiled = compileQuietly(schema)
    assert.ok(compiled.skeletonTrees[compiled.mainTree])
  })
})
