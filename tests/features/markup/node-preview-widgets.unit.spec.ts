import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'
import { computeNodePreviewRanges } from '../../../shared/markup/codemirror/node-preview-widgets.ts'

test.describe('computeNodePreviewRanges', () => {
  test('returns no ranges when the toggle set is empty', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(sourceMap, new Set())
    assert.equal(ranges.length, 0)
  })

  test('returns a range at the element end for a toggled top-level element', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(sourceMap, new Set(['/0']))
    assert.equal(ranges.length, 1)
    assert.equal(ranges[0].elementPointer, '/0')
    const expected = sourceMap.byElementPointer.get('/0')!
    assert.equal(ranges[0].from, expected.to)
    assert.equal(ranges[0].to, expected.to)
  })

  test('supports self-closing tags', () => {
    const src = '<divider />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(sourceMap, new Set(['/0']))
    assert.equal(ranges.length, 1)
    const expected = sourceMap.byElementPointer.get('/0')!
    assert.equal(ranges[0].from, expected.to)
  })

  test('supports nested elements inside a container', () => {
    const src = [
      '<card>',
      '  <text>inner</text>',
      '</card>'
    ].join('\n')
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(sourceMap, new Set(['/0/children/0']))
    assert.equal(ranges.length, 1)
    assert.equal(ranges[0].elementPointer, '/0/children/0')
    const expected = sourceMap.byElementPointer.get('/0/children/0')!
    assert.equal(ranges[0].from, expected.to)
  })

  test('omits ranges for pointers missing from the source map', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(sourceMap, new Set(['/0', '/99']))
    assert.equal(ranges.length, 1)
    assert.equal(ranges[0].elementPointer, '/0')
  })

  test('returns ranges sorted by from offset', () => {
    const src = [
      '<title titleSize="h2">A</title>',
      '<text>B</text>',
      '<divider />'
    ].join('\n')
    const { sourceMap } = deserializeElements(src)
    const ranges = computeNodePreviewRanges(sourceMap, new Set(['/2', '/0', '/1']))
    assert.equal(ranges.length, 3)
    assert.ok(ranges[0].from <= ranges[1].from)
    assert.ok(ranges[1].from <= ranges[2].from)
    assert.deepEqual(ranges.map(r => r.elementPointer), ['/0', '/1', '/2'])
  })
})
