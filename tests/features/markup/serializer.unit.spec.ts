import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { serializeElements } from '../../../shared/markup/serializer.ts'

test.describe('markup serializer', () => {
  test('renders a self-closing element with no attributes', () => {
    const out = serializeElements([
      { type: 'divider' }
    ])
    assert.equal(out, '<divider />')
  })

  test('renders content property as inner text', () => {
    const out = serializeElements([
      { type: 'title', content: 'Hello world', titleSize: 'h2' }
    ])
    // titleSize 'h2' is not default ('h3'), content is inner text
    assert.equal(out, '<title titleSize="h2">Hello world</title>')
  })

  test('omits attributes equal to schema default', () => {
    const out = serializeElements([
      // titleSize default is 'h3', titleTag has no default
      { type: 'title', content: 'Hi', titleSize: 'h3' }
    ])
    assert.equal(out, '<title>Hi</title>')
  })

  test('emits dot-notation attributes for nested objects', () => {
    const out = serializeElements([
      {
        type: 'title',
        content: 'Hi',
        icon: { color: 'primary', mdi: { name: 'home' } }
      }
    ])
    // dot-separated names, emitted in descriptor order
    assert.equal(
      out,
      '<title icon.color="primary" icon.mdi.name="home">Hi</title>'
    )
  })

  test('emits uuid as the first attribute on dataset-table', () => {
    const out = serializeElements([
      {
        type: 'dataset-table',
        uuid: 'abcd1234',
        dataset: { id: 'ds1' },
        interactions: true,
        syncParams: 'sandboxed'
      }
    ])
    assert.ok(out.startsWith('<dataset-table uuid="abcd1234"'), `unexpected: ${out}`)
    assert.ok(out.includes('syncParams="sandboxed"'), `unexpected: ${out}`)
  })

  test('escapes & and " in attribute values', () => {
    const out = serializeElements([
      { type: 'dataset-table', uuid: 'a&b"c', dataset: { id: 'ds1' }, interactions: true }
    ])
    assert.ok(out.includes('uuid="a&amp;b&quot;c"'), `unexpected output: ${out}`)
  })

  test('escapes < and & in content', () => {
    const out = serializeElements([
      { type: 'title', content: '1 < 2 & 3' }
    ])
    assert.ok(out.includes('>1 &lt; 2 &amp; 3</title>'), `unexpected output: ${out}`)
  })

  test('renders direct children inside virtualTag wrappers (two-columns)', () => {
    const out = serializeElements([
      {
        type: 'two-columns',
        disposition: 'equal',
        gutter: 'default',
        children: [{ type: 'divider' }],
        children2: [{ type: 'divider' }]
      }
    ])
    const expected = [
      '<two-columns>',
      '  <left>',
      '    <divider />',
      '  </left>',
      '  <right>',
      '    <divider />',
      '  </right>',
      '</two-columns>'
    ].join('\n')
    assert.equal(out, expected)
  })

  test('renders structured slot items (tabs) with nested children', () => {
    const out = serializeElements([
      {
        type: 'tabs',
        align: 'start',
        border: true,
        mb: 0,
        tabs: [
          { title: 'One', children: [{ type: 'divider' }] },
          { title: 'Two', children: [] }
        ]
      }
    ])
    const expected = [
      '<tabs>',
      '  <tab title="One">',
      '    <divider />',
      '  </tab>',
      '  <tab title="Two" />',
      '</tabs>'
    ].join('\n')
    assert.equal(out, expected)
  })

  test('renders link-kind slot items (menu links) as self-closing', () => {
    const out = serializeElements([
      {
        type: 'menu',
        label: 'Menu',
        usePortalConfig: true,
        links: [
          { type: 'portal', subtype: 'home', pageRef: { slug: 'h', title: 'Home' }, href: '/' },
          { type: 'external', subtype: 'home', pageRef: { slug: 'x', title: 'X' }, href: 'https://example.com' }
        ]
      }
    ])
    assert.ok(out.startsWith('<menu'), `unexpected output: ${out}`)
    assert.ok(out.includes('<link type="portal"'), `missing first link: ${out}`)
    assert.ok(out.includes('<link type="external"'), `missing second link: ${out}`)
    assert.ok(out.trim().endsWith('</menu>'), `bad closing: ${out}`)
  })

  test('omits unknown element types', () => {
    const out = serializeElements([
      { type: 'title', content: 'A' },
      { type: 'not-a-real-type' },
      { type: 'divider' }
    ])
    assert.equal(out, '<title>A</title>\n<divider />')
  })

  test('joins string-array attributes with commas', () => {
    const out = serializeElements([
      { type: 'metrics', metrics: ['datasets', 'records'] }
    ])
    assert.ok(out.includes('metrics="datasets,records"'), `unexpected output: ${out}`)
  })

  test('omits string-array attribute when value deep-equals default', () => {
    const out = serializeElements([
      { type: 'metrics', metrics: ['datasets', 'records', 'applications'] }
    ])
    assert.equal(out, '<metrics />')
  })
})
