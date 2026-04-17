import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { serializeElements } from '../../../shared/markup/serializer.ts'

test.describe('markup serializer', () => {
  test('renders a self-closing element with no attributes beyond uuid', () => {
    const out = serializeElements([
      { type: 'divider', uuid: 'abc12345' }
    ])
    assert.equal(out, '<divider uuid="abc12345" />')
  })

  test('renders content property as inner text', () => {
    const out = serializeElements([
      { type: 'title', uuid: 'u1', content: 'Hello world', titleSize: 'h2' }
    ])
    // titleSize 'h2' is not default ('h3'), uuid present, content is inner text
    assert.equal(out, '<title uuid="u1" titleSize="h2">Hello world</title>')
  })

  test('omits attributes equal to schema default', () => {
    const out = serializeElements([
      // titleSize default is 'h3', titleTag has no default
      { type: 'title', uuid: 'u1', content: 'Hi', titleSize: 'h3' }
    ])
    assert.equal(out, '<title uuid="u1">Hi</title>')
  })

  test('emits dot-notation attributes for nested objects', () => {
    const out = serializeElements([
      {
        type: 'title',
        uuid: 'u1',
        content: 'Hi',
        icon: { color: 'primary', mdi: { name: 'home' } }
      }
    ])
    // dot-separated names, emitted in descriptor order (icon.color, icon.custom, icon.mdi.name…)
    assert.equal(
      out,
      '<title uuid="u1" icon.color="primary" icon.mdi.name="home">Hi</title>'
    )
  })

  test('escapes & and " in attribute values', () => {
    const out = serializeElements([
      { type: 'title', uuid: 'a&b"c', content: 'x' }
    ])
    assert.ok(out.includes('uuid="a&amp;b&quot;c"'), `unexpected output: ${out}`)
  })

  test('escapes < and & in content', () => {
    const out = serializeElements([
      { type: 'title', uuid: 'u1', content: '1 < 2 & 3' }
    ])
    assert.ok(out.includes('>1 &lt; 2 &amp; 3</title>'), `unexpected output: ${out}`)
  })

  test('renders direct children inside virtualTag wrappers (two-columns)', () => {
    const out = serializeElements([
      {
        type: 'two-columns',
        uuid: 'c1',
        disposition: 'equal',
        gutter: 'default',
        children: [{ type: 'divider', uuid: 'L' }],
        children2: [{ type: 'divider', uuid: 'R' }]
      }
    ])
    const expected = [
      '<two-columns uuid="c1">',
      '  <left>',
      '    <divider uuid="L" />',
      '  </left>',
      '  <right>',
      '    <divider uuid="R" />',
      '  </right>',
      '</two-columns>'
    ].join('\n')
    assert.equal(out, expected)
  })

  test('renders structured slot items (tabs) with nested children', () => {
    const out = serializeElements([
      {
        type: 'tabs',
        uuid: 't1',
        align: 'start',
        border: true,
        mb: 0,
        tabs: [
          { title: 'One', children: [{ type: 'divider', uuid: 'd1' }] },
          { title: 'Two', children: [] }
        ]
      }
    ])
    const expected = [
      '<tabs uuid="t1">',
      '  <tab title="One">',
      '    <divider uuid="d1" />',
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
        uuid: 'm1',
        label: 'Menu',
        usePortalConfig: true,
        links: [
          { type: 'portal', subtype: 'home', pageRef: { slug: 'h', title: 'Home' }, href: '/' },
          { type: 'external', subtype: 'home', pageRef: { slug: 'x', title: 'X' }, href: 'https://example.com' }
        ]
      }
    ])
    assert.ok(out.startsWith('<menu uuid="m1">'), `unexpected output: ${out}`)
    assert.ok(out.includes('<link type="portal"'), `missing first link: ${out}`)
    assert.ok(out.includes('<link type="external"'), `missing second link: ${out}`)
    assert.ok(out.trim().endsWith('</menu>'), `bad closing: ${out}`)
  })

  test('omits unknown element types', () => {
    const out = serializeElements([
      { type: 'title', uuid: 'u1', content: 'A' },
      { type: 'not-a-real-type', uuid: 'x' },
      { type: 'divider', uuid: 'u2' }
    ])
    assert.equal(out, '<title uuid="u1">A</title>\n<divider uuid="u2" />')
  })
})
