import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { serializeElements } from '../../../shared/markup/serializer.ts'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'

test.describe('markup deserializer', () => {
  test('parses a self-closing element', () => {
    const { elements, errors } = deserializeElements('<divider />')
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [{ type: 'divider' }])
  })

  test('result always includes a source map', () => {
    const ok = deserializeElements('<divider />')
    assert.ok(ok.sourceMap.byElementPointer.has('/0'))
    const bad = deserializeElements('<not-a-tag />')
    // elements is null but the source map is still populated on a best-effort basis
    assert.equal(bad.elements, null)
    assert.ok(bad.sourceMap, 'source map is always defined')
  })

  test('parses content property as inner text', () => {
    const { elements, errors } = deserializeElements(
      '<title titleSize="h2">Hello world</title>'
    )
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [
      { type: 'title', titleSize: 'h2', content: 'Hello world' }
    ])
  })

  test('expands dot-notation into nested objects', () => {
    const { elements, errors } = deserializeElements(
      '<title icon.color="primary" icon.mdi.name="home">Hi</title>'
    )
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [
      {
        type: 'title',
        content: 'Hi',
        icon: { color: 'primary', mdi: { name: 'home' } }
      }
    ])
  })

  test('coerces boolean and integer attributes', () => {
    const { elements, errors } = deserializeElements(
      '<title bold="true" centered="false">T</title>'
    )
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [
      { type: 'title', bold: true, centered: false, content: 'T' }
    ])
  })

  test('unescapes & and " in content', () => {
    const { elements, errors } = deserializeElements(
      '<title>1 &lt; 2 &amp; 3</title>'
    )
    assert.deepEqual(errors, [])
    assert.equal(elements?.[0].content, '1 < 2 & 3')
  })

  test('parses virtualTag direct wrappers (two-columns)', () => {
    const src = [
      '<two-columns>',
      '  <left>',
      '    <divider />',
      '  </left>',
      '  <right>',
      '    <divider />',
      '  </right>',
      '</two-columns>'
    ].join('\n')
    const { elements, errors } = deserializeElements(src)
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [
      {
        type: 'two-columns',
        children: [{ type: 'divider' }],
        children2: [{ type: 'divider' }]
      }
    ])
  })

  test('parses structured slot items (tabs)', () => {
    const src = [
      '<tabs>',
      '  <tab title="One">',
      '    <divider />',
      '  </tab>',
      '  <tab title="Two" />',
      '</tabs>'
    ].join('\n')
    const { elements, errors } = deserializeElements(src)
    assert.deepEqual(errors, [])
    assert.deepEqual(elements, [
      {
        type: 'tabs',
        tabs: [
          { title: 'One', children: [{ type: 'divider' }] },
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
      '<title nope="x">Hi</title>'
    )
    assert.equal(elements, null)
    assert.equal(errors.length, 1)
    assert.match(errors[0].message, /unknown attribute 'nope'/)
  })

  test('reports missing closing tag', () => {
    const { elements, errors } = deserializeElements('<banner><divider />')
    assert.equal(elements, null)
    assert.ok(errors.some(e => /missing closing tag/.test(e.message)), JSON.stringify(errors))
  })

  test('reports enum violation', () => {
    const { elements, errors } = deserializeElements(
      '<title color="not-a-color">x</title>'
    )
    assert.equal(elements, null)
    assert.ok(errors.some(e => /not in enum/.test(e.message)))
  })

  test('round-trips JSON -> markup -> JSON (simple case)', () => {
    const original = [
      {
        type: 'two-columns',
        children: [
          { type: 'title', content: 'Left', titleSize: 'h2' }
        ],
        children2: [
          { type: 'divider' }
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
        tabs: [
          { title: 'One', children: [{ type: 'divider' }] },
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
      '<two-columns>',
      '  <left>',
      '    <title>Left</title>',
      '  </left>',
      '  <right>',
      '    <divider />',
      '  </right>',
      '</two-columns>'
    ].join('\n')
    const { elements, errors } = deserializeElements(markup)
    assert.deepEqual(errors, [])
    assert.equal(serializeElements(elements ?? []), markup)
  })

  test.describe('uuid auto-heal', () => {
    test('preserves a unique uuid on dataset-table', () => {
      const { elements, errors } = deserializeElements(
        '<dataset-table uuid="abcd1234" dataset.id="ds1" interactions="true" />'
      )
      assert.deepEqual(errors, [])
      assert.equal(elements?.[0].uuid, 'abcd1234')
    })

    test('fills a missing uuid on dataset-table', () => {
      const { elements, errors } = deserializeElements(
        '<dataset-table dataset.id="ds1" interactions="true" />'
      )
      assert.deepEqual(errors, [])
      assert.equal(typeof elements?.[0].uuid, 'string')
      assert.ok((elements?.[0].uuid as string).length > 0)
    })

    test('regenerates duplicate uuids across copy-pasted elements', () => {
      const src = [
        '<dataset-table uuid="same" dataset.id="ds1" interactions="true" />',
        '<dataset-table uuid="same" dataset.id="ds2" interactions="true" />',
        '<application uuid="same" application.id="a1" application.slug="a1" application.title="A1" />'
      ].join('\n')
      const { elements, errors } = deserializeElements(src)
      assert.deepEqual(errors, [])
      const uuids = elements?.map((el: any) => el.uuid)
      assert.equal(uuids?.[0], 'same', 'first occurrence keeps the uuid')
      assert.notEqual(uuids?.[1], 'same', 'second occurrence gets a fresh uuid')
      assert.notEqual(uuids?.[2], 'same', 'third occurrence gets a fresh uuid')
      assert.notEqual(uuids?.[1], uuids?.[2], 'regenerated uuids are distinct')
    })

    test('heals uuids inside nested containers', () => {
      const src = [
        '<two-columns>',
        '  <left>',
        '    <dataset-table uuid="dup" dataset.id="ds1" interactions="true" />',
        '  </left>',
        '  <right>',
        '    <dataset-table uuid="dup" dataset.id="ds2" interactions="true" />',
        '  </right>',
        '</two-columns>'
      ].join('\n')
      const { elements, errors } = deserializeElements(src)
      assert.deepEqual(errors, [])
      const left = elements?.[0].children?.[0]
      const right = elements?.[0].children2?.[0]
      assert.equal(left.uuid, 'dup')
      assert.notEqual(right.uuid, 'dup')
    })
  })

  test.describe('string-array attributes', () => {
    test('splits comma-separated values and trims whitespace', () => {
      const { elements, errors } = deserializeElements(
        '<metrics metrics="datasets, records" />'
      )
      assert.deepEqual(errors, [])
      assert.deepEqual(elements, [
        { type: 'metrics', metrics: ['datasets', 'records'] }
      ])
    })

    test('reports items that are not in the enum', () => {
      const { elements, errors } = deserializeElements(
        '<metrics metrics="datasets,bogus" />'
      )
      assert.equal(elements, null)
      assert.equal(errors.length, 1)
      assert.match(errors[0].message, /item 'bogus' not in enum/)
    })
  })
})
