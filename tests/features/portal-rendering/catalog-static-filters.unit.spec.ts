import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { staticFilterParam, isStaticFilterAllowed } from '../../../portal/app/utils/catalog-static-filters.ts'

const included = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }]
const excluded = [{ id: 'x', title: 'X' }]

test.describe('staticFilterParam', () => {
  test('is undefined without any value', () => {
    assert.equal(staticFilterParam(undefined), undefined)
    assert.equal(staticFilterParam([], [], []), undefined)
  })

  test('sends the visitor choices when there is no static filter', () => {
    assert.equal(staticFilterParam(['a', 'c']), 'a,c')
  })

  test('sends the included values when the visitor chose nothing', () => {
    assert.equal(staticFilterParam([], included), 'a,b')
  })

  test('narrows the included values down to the visitor choices', () => {
    assert.equal(staticFilterParam(['b'], included), 'b')
    assert.equal(staticFilterParam(['b', 'c'], included), 'b')
  })

  test('falls back to the included values when no visitor choice is allowed', () => {
    assert.equal(staticFilterParam(['c'], included), 'a,b')
  })

  test('appends the excluded values prefixed with a dash', () => {
    assert.equal(staticFilterParam([], [], excluded), '-x')
    assert.equal(staticFilterParam(['a'], [], excluded), 'a,-x')
    assert.equal(staticFilterParam([], included, excluded), 'a,b,-x')
  })
})

test.describe('isStaticFilterAllowed', () => {
  test('allows everything without static filter', () => {
    assert.equal(isStaticFilterAllowed('c'), true)
  })

  test('only allows the included values', () => {
    assert.equal(isStaticFilterAllowed('a', included), true)
    assert.equal(isStaticFilterAllowed('c', included), false)
  })

  test('rejects the excluded values', () => {
    assert.equal(isStaticFilterAllowed('x', [], excluded), false)
    assert.equal(isStaticFilterAllowed('a', [], excluded), true)
  })
})
