import { test } from '@playwright/test'
import assert from 'node:assert/strict'
// @ts-ignore untyped schema module
import pageConfigSimpleSchema from '../../../api/types/page-config-simple/schema.js'
// @ts-ignore untyped schema module
import pageElementsSchema from '../../../api/types/page-elements/schema.ts'

// Layout elements (banner, card, two columns, tabs...) nest other elements. The page
// editor hides those arrays with layout: 'none' because it manipulates them on its
// canvas. page-config-simple is the context that drives the WebMCP tools and the
// form-based simple editor, where nesting has to be reachable through the form itself.

const isElementArray = (node: any) =>
  node?.type === 'array' && typeof node.items?.$ref === 'string' && node.items.$ref.includes('$defs/element')

const collectElementArrays = (node: any, out: any[] = []): any[] => {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    for (const item of node) collectElementArrays(item, out)
    return out
  }
  if (isElementArray(node)) out.push(node)
  for (const value of Object.values(node)) collectElementArrays(value, out)
  return out
}

test.describe('page-config-simple recursion', () => {
  test('should expose the nested element arrays to the form', () => {
    const arrays = collectElementArrays(pageConfigSimpleSchema.$defs.element)
    assert.ok(arrays.length >= 7, `expected the layout elements' nested arrays, found ${arrays.length}`)
    for (const array of arrays) {
      assert.notEqual(array.layout, 'none', 'a nested element array must not be hidden')
      assert.equal(typeof array.layout, 'object', 'a nested element array needs a real layout')
      assert.ok(array.layout.title, 'a nested element array needs a title, or agents see a bare key')
      assert.equal(array.layout.listEditMode, 'dialog')
    }
  })

  test('should point nested items at the simplified element, not the canvas one', () => {
    // Left on the absolute page-elements ref, a nested item resolves back to the canvas
    // definition one level down: the summary slot returns and the grandchildren hide
    // again, so the fix would only ever work at depth 1.
    for (const array of collectElementArrays(pageConfigSimpleSchema.$defs.element)) {
      assert.equal(array.items.$ref, '#/$defs/element')
    }
  })

  test('should leave the page-elements definition untouched', () => {
    // page-config-simple derives from a shared definition; mutating it in place would
    // silently change the canvas editor too.
    const arrays = collectElementArrays(pageElementsSchema.$defs.element)
    assert.ok(arrays.length >= 7)
    for (const array of arrays) assert.equal(array.layout, 'none')
  })
})
