import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { serializeElements } from '../../../shared/markup/serializer.ts'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'

test.describe('markup deserializer', () => {
  test('parses a self-closing element', () => {
    const { elements, errors } = deserializeElements('<divider uuid="a1" />')
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [{ type: 'divider', uuid: 'a1' }])
  })

  test('parses content property as inner text', () => {
    const { elements, errors } = deserializeElements(
      '<title uuid="u1" titleSize="h2">Hello world</title>'
    )
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [
      { type: 'title', uuid: 'u1', titleSize: 'h2', content: 'Hello world' }
    ])
  })

  test('expands dot-notation into nested objects', () => {
    const { elements, errors } = deserializeElements(
      '<title uuid="u1" icon.color="primary" icon.mdi.name="home">Hi</title>'
    )
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [
      {
        type: 'title',
        uuid: 'u1',
        content: 'Hi',
        icon: { color: 'primary', mdi: { name: 'home' } }
      }
    ])
  })

  test('coerces boolean and integer attributes', () => {
    const { elements, errors } = deserializeElements(
      '<title uuid="u1" bold="true" centered="false">T</title>'
    )
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [
      { type: 'title', uuid: 'u1', bold: true, centered: false, content: 'T' }
    ])
  })

  test('unescapes & and " in attribute values', () => {
    const { elements, errors } = deserializeElements(
      '<title uuid="a&amp;b&quot;c">x</title>'
    )
    assert.deepEqual(errors, [])
    assert.equal(elements?.[0].uuid, 'a&b"c')
  })

  test('unescapes < and & in content', () => {
    const { elements, errors } = deserializeElements(
      '<title uuid="u1">1 &lt; 2 &amp; 3</title>'
    )
    assert.deepEqual(errors, [])
    assert.equal(elements?.[0].content, '1 < 2 & 3')
  })

  test('parses virtualTag direct wrappers (two-columns)', () => {
    const src = [
      '<two-columns uuid="c1">',
      '  <left>',
      '    <divider uuid="L" />',
      '  </left>',
      '  <right>',
      '    <divider uuid="R" />',
      '  </right>',
      '</two-columns>'
    ].join('\n')
    const { elements, errors } = deserializeElements(src)
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [
      {
        type: 'two-columns',
        uuid: 'c1',
        children: [{ type: 'divider', uuid: 'L' }],
        children2: [{ type: 'divider', uuid: 'R' }]
      }
    ])
  })

  test('parses structured slot items (tabs)', () => {
    const src = [
      '<tabs uuid="t1">',
      '  <tab title="One">',
      '    <divider uuid="d1" />',
      '  </tab>',
      '  <tab title="Two" />',
      '</tabs>'
    ].join('\n')
    const { elements, errors } = deserializeElements(src)
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [
      {
        type: 'tabs',
        uuid: 't1',
        tabs: [
          { title: 'One', children: [{ type: 'divider', uuid: 'd1' }] },
          { title: 'Two', children: [] }
        ]
      }
    ])
  })

  test('reports unknown tag as error, returns null elements', () => {
    const { elements, errors } = deserializeElements('<not-a-tag />')
    assert.equal(elements, null)
    assert.equal(errors.length, 1)
    assert.match(errors[0].message, /unknown element/)
  })

  test('reports unknown attribute as error', () => {
    const { elements, errors } = deserializeElements(
      '<title uuid="u1" nope="x">Hi</title>'
    )
    assert.equal(elements, null)
    assert.equal(errors.length, 1)
    assert.match(errors[0].message, /unknown attribute 'nope'/)
  })

  test('reports missing closing tag', () => {
    const { elements, errors } = deserializeElements('<banner uuid="b1"><divider />')
    assert.equal(elements, null)
    assert.ok(errors.some(e => /missing closing tag/.test(e.message)), JSON.stringify(errors))
  })

  test('reports enum violation', () => {
    const { elements, errors } = deserializeElements(
      '<title uuid="u1" color="not-a-color">x</title>'
    )
    assert.equal(elements, null)
    assert.ok(errors.some(e => /not in enum/.test(e.message)))
  })

  test('round-trips JSON -> markup -> JSON (simple case)', () => {
    const original = [
      {
        type: 'two-columns',
        uuid: 'c1',
        children: [
          { type: 'title', uuid: 'u1', content: 'Left', titleSize: 'h2' }
        ],
        children2: [
          { type: 'divider', uuid: 'd1' }
        ]
      }
    ]
    const markup = serializeElements(original)
    const { elements, errors } = deserializeElements(markup)
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, original)
  })

  test('round-trips with structured slot (tabs)', () => {
    const original = [
      {
        type: 'tabs',
        uuid: 't1',
        tabs: [
          { title: 'One', children: [{ type: 'divider', uuid: 'd1' }] },
          { title: 'Two', children: [] }
        ]
      }
    ]
    const markup = serializeElements(original)
    const { elements, errors } = deserializeElements(markup)
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, original)
  })

  test('round-trips markup -> JSON -> markup (stable formatting)', () => {
    const markup = [
      '<two-columns uuid="c1">',
      '  <left>',
      '    <title uuid="u1">Left</title>',
      '  </left>',
      '  <right>',
      '    <divider uuid="d1" />',
      '  </right>',
      '</two-columns>'
    ].join('\n')
    const { elements, errors } = deserializeElements(markup)
    assert.deepEqual(errors, [])
    assert.equal(serializeElements(elements ?? []), markup)
  })
})
