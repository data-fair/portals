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

type NestedArray = { key: string, array: any }

const collectElementArrays = (node: any, out: NestedArray[] = []): NestedArray[] => {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    for (const item of node) collectElementArrays(item, out)
    return out
  }
  for (const [key, value] of Object.entries(node)) {
    if (isElementArray(value)) out.push({ key, array: value })
    collectElementArrays(value, out)
  }
  return out
}

const simpleArrays = () => collectElementArrays(pageConfigSimpleSchema.$defs.element)

test.describe('page-config-simple recursion', () => {
  test('should expose the nested element arrays to the form', () => {
    const arrays = simpleArrays()
    assert.ok(arrays.length >= 7, `expected the layout elements' nested arrays, found ${arrays.length}`)
    for (const { key, array } of arrays) {
      assert.notEqual(array.layout, 'none', `${key} must not be hidden`)
      assert.equal(typeof array.layout, 'object', `${key} needs a real layout`)
      assert.ok(array.layout.title, `${key} needs a title, or agents see a bare key`)
      assert.equal(array.layout.listEditMode, 'dialog')
    }
  })

  test('should point nested items at the simplified element, not the canvas one', () => {
    // Left on the absolute page-elements ref, a nested item resolves back to the canvas
    // definition one level down: the summary slot returns and the grandchildren hide
    // again, so the fix would only ever work at depth 1.
    for (const { array } of simpleArrays()) {
      assert.equal(array.items.$ref, '#/$defs/element')
    }
  })

  test('should name the advanced filters for what they are and follow their switch', () => {
    // advancedFilters has exactly the shape of a children array, so it is unhidden too.
    // But it is a strip of filter blocks, not content, and catalog-layout only renders it
    // when showAdvancedFilters is on: without the condition an agent can fill an array
    // that is never drawn.
    const advanced = simpleArrays().filter(({ key }) => key === 'advancedFilters')
    assert.equal(advanced.length, 5, 'the five catalog elements each have an advancedFilters array')
    for (const { array } of advanced) {
      assert.equal(array.layout.title, 'Advanced filters')
      assert.equal(array.layout['x-i18n-title'].fr, 'Filtres avancés')
      assert.equal(array.layout.if, 'parent.data?.showAdvancedFilters')
    }
  })

  test('should leave the content arrays unconditional', () => {
    for (const { key, array } of simpleArrays().filter(({ key }) => key !== 'advancedFilters')) {
      assert.equal(array.layout.if, undefined, `${key} is content, it must not be conditioned`)
      assert.ok(array.layout.title.includes('ontent'), `${key} is content, it should be titled as such`)
    }
  })

  test('should leave the page-elements definition untouched', () => {
    // page-config-simple derives from a shared definition; mutating it in place would
    // silently change the canvas editor too.
    const arrays = collectElementArrays(pageElementsSchema.$defs.element)
    assert.ok(arrays.length >= 7)
    for (const { array } of arrays) assert.equal(array.layout, 'none')
  })
})
