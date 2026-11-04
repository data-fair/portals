import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { compile } from '@json-layout/core'
import { StatefulLayout } from '@json-layout/core/state'
import { bundleSchema, bakeContext } from '../../../api/src/draft-configs/operations.ts'
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

// the context values the form expressions still read
const contextReferences = (schema: object): string[] => {
  const found = new Set<string>()
  JSON.stringify(schema, (_key, value) => {
    if (typeof value === 'string') for (const match of value.matchAll(/(?<![\w.])(?:options\.)?context\.\w+/g)) found.add(match[0])
    return value
  })
  return [...found]
}

// a form state as an editor session creates it: no context, the document as data. Any expression
// that throws is logged by json-layout (an "if" is then treated as false). Answers the URLs the
// form fetched its items from.
const createState = async (compiled: any, data: unknown) => {
  const warnings: unknown[] = []
  const fetched: string[] = []
  const warn = console.warn
  console.warn = (...args: unknown[]) => warnings.push(args)
  try {
    const fetch = async (url: string) => { fetched.push(url); return [] }
    const state = new StatefulLayout(compiled, compiled.skeletonTrees[compiled.mainTree], { fetch, fetchBaseURL: 'http://test.local/' }, data)
    assert.ok(state.stateTree)
    await new Promise(resolve => setTimeout(resolve, 10))
  } finally {
    console.warn = warn
  }
  assert.deepEqual(warnings, [])
  return fetched
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

  // a js template of json-layout, as in the topics getItems url
  /* eslint-disable no-template-curly-in-string */
  test('bakeContext writes the context values into the expressions', () => {
    const baked: any = bakeContext({
      properties: {
        a: { layout: { if: 'context.pageType === "event"' } },
        b: { layout: { if: 'options.context.pageType !== "home"' } },
        c: { layout: { getItems: { url: '/settings/${context.owner.type}/${context.owner.id}' } } },
        d: { layout: { if: 'parentContext.pageType' } }
      }
    }, { pageType: 'event', owner: { type: 'organization', id: 'o1' } })
    assert.equal(baked.properties.a.layout.if, '("event") === "event"')
    assert.equal(baked.properties.b.layout.if, '("event") !== "home"')
    assert.equal(baked.properties.c.layout.getItems.url, '/settings/${({"type":"organization","id":"o1"}).type}/${({"type":"organization","id":"o1"}).id}')
    assert.equal(baked.properties.d.layout.if, 'parentContext.pageType')
  })
  /* eslint-enable no-template-curly-in-string */

  test('the page config schema is self-contained and compiles with json-layout', async () => {
    test.slow()
    const schema: any = await pageConfigSchema('event')
    assert.ok(refsOf(schema).every(ref => ref.startsWith('#')), 'every ref is local')
    assert.deepEqual(contextReferences(schema), [])
    assert.ok(schema.properties.elements)
    const compiled = compileQuietly(schema)
    await createState(compiled, {
      title: 'Event',
      eventMetadata: { slug: 'event' },
      elements: [
        { type: 'text', content: 'Un **texte**' },
        { type: 'link', label: 'Lien', linkType: 'generic' }
      ]
    })
  })

  test('the portal config schema is self-contained and compiles with json-layout', async () => {
    test.slow()
    const schema: any = await portalConfigSchema({ owner: { type: 'organization', id: 'test_org1', name: 'Org' } })
    assert.ok(refsOf(schema).every(ref => ref.startsWith('#')), 'every ref is local')
    assert.deepEqual(contextReferences(schema), [])
    const compiled = compileQuietly(schema)
    const fetched = await createState(compiled, { title: 'Portal', menu: { children: [] }, footer: { copyright: true } })
    assert.ok(fetched.some(url => url.includes('/settings/organization/test_org1/topics')), 'the topics of the portal owner')
  })
})
