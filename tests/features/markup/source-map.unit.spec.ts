import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'

test.describe('markup source map', () => {
  test('returns an empty source map for empty input', () => {
    const { sourceMap } = deserializeElements('')
    assert.equal(sourceMap.byPointer.size, 0)
    assert.equal(sourceMap.byElementPointer.size, 0)
  })

  test('records the element open-tag range for a self-closing element', () => {
    const src = '<divider />'
    const { sourceMap } = deserializeElements(src)
    const range = sourceMap.byElementPointer.get('/0')
    assert.ok(range, 'element pointer recorded')
    assert.equal(src.slice(range.from, range.to), '<divider />')
  })

  test('records attribute value ranges tight between quotes', () => {
    const src = '<title titleSize="h2" centered="true">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const titleSize = sourceMap.byPointer.get('/0/titleSize')
    assert.ok(titleSize, 'titleSize range present')
    assert.equal(src.slice(titleSize.from, titleSize.to), 'h2')
    const centered = sourceMap.byPointer.get('/0/centered')
    assert.ok(centered, 'centered range present')
    assert.equal(src.slice(centered.from, centered.to), 'true')
  })

  test('records dot-path attributes under their nested json path', () => {
    const src = '<title icon.color="primary" icon.mdi.name="home">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const color = sourceMap.byPointer.get('/0/icon/color')
    assert.ok(color)
    assert.equal(src.slice(color.from, color.to), 'primary')
    const mdiName = sourceMap.byPointer.get('/0/icon/mdi/name')
    assert.ok(mdiName)
    assert.equal(src.slice(mdiName.from, mdiName.to), 'home')
  })

  test('records content range for content-property tags', () => {
    const src = '<title>Hello world</title>'
    const { sourceMap } = deserializeElements(src)
    const content = sourceMap.byPointer.get('/0/content')
    assert.ok(content)
    assert.equal(src.slice(content.from, content.to), 'Hello world')
  })

  test('records children under a structured slot with proper indices', () => {
    const src = [
      '<tabs>',
      '  <tab title="One">',
      '    <divider />',
      '  </tab>',
      '  <tab title="Two" />',
      '</tabs>'
    ].join('\n')
    const { sourceMap } = deserializeElements(src)
    const tab0Title = sourceMap.byPointer.get('/0/tabs/0/title')
    const tab1Title = sourceMap.byPointer.get('/0/tabs/1/title')
    assert.ok(tab0Title)
    assert.ok(tab1Title)
    assert.equal(src.slice(tab0Title.from, tab0Title.to), 'One')
    assert.equal(src.slice(tab1Title.from, tab1Title.to), 'Two')
    const divider = sourceMap.byElementPointer.get('/0/tabs/0/children/0')
    assert.ok(divider)
    assert.equal(src.slice(divider.from, divider.to), '<divider />')
  })

  test('records direct-slot children across multiple virtual wrappers', () => {
    const src = [
      '<two-columns>',
      '  <left>',
      '    <divider />',
      '  </left>',
      '  <right>',
      '    <title>Right</title>',
      '  </right>',
      '</two-columns>'
    ].join('\n')
    const { sourceMap } = deserializeElements(src)
    const leftChild = sourceMap.byElementPointer.get('/0/children/0')
    const rightChild = sourceMap.byElementPointer.get('/0/children2/0')
    assert.ok(leftChild, 'left child recorded')
    assert.ok(rightChild, 'right child recorded')
    assert.equal(src.slice(leftChild.from, leftChild.to), '<divider />')
  })

  test('populates source map on best-effort even when parse has errors', () => {
    const src = '<title titleSize="h2">Hi</title>\n<not-a-tag />'
    const { sourceMap, errors } = deserializeElements(src)
    assert.ok(errors.length > 0, 'parse reports an error')
    assert.ok(sourceMap.byElementPointer.has('/0'), 'first element still mapped')
    const titleSize = sourceMap.byPointer.get('/0/titleSize')
    assert.ok(titleSize)
    assert.equal(src.slice(titleSize.from, titleSize.to), 'h2')
  })
})
