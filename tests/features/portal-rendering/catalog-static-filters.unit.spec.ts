import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { staticFilterParam, isStaticFilterAllowed, hasStaticFilters, resolveStaticFilters, staticFiltersQuery } from '../../../portal/app/utils/catalog-static-filters.ts'

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

test.describe('hasStaticFilters', () => {
  test('ignores missing and empty groups', () => {
    assert.equal(hasStaticFilters(undefined), false)
    assert.equal(hasStaticFilters({ includedTopics: [], types: [] }), false)
    assert.equal(hasStaticFilters({ excludedOwners: excluded }), true)
  })
})

test.describe('resolveStaticFilters', () => {
  test('own filters replace the inherited ones', () => {
    assert.deepEqual(resolveStaticFilters({ includedTopics: included }, { includedKeywords: excluded }), { includedTopics: included })
  })

  test('empty own filters inherit', () => {
    assert.deepEqual(resolveStaticFilters({ includedTopics: [] }, { includedKeywords: excluded }), { includedKeywords: excluded })
    assert.equal(resolveStaticFilters(undefined, undefined), undefined)
  })
})

test.describe('staticFiltersQuery', () => {
  test('is empty without filters', () => {
    assert.deepEqual(staticFiltersQuery(undefined), {})
  })

  test('maps every filter to its data-fair param', () => {
    assert.deepEqual(staticFiltersQuery({
      includedOwners: included,
      excludedOwners: excluded,
      includedTopics: included,
      includedConcepts: included,
      includedKeywords: included,
      includedBaseApplications: included,
      types: ['file', 'rest']
    }), {
      owner: 'a,b,-x', topics: 'a,b', concepts: 'a,b', keywords: 'a,b', 'base-application': 'a,b', type: 'file,rest'
    })
  })

  test('excluded owners alone only reach the owner param', () => {
    assert.deepEqual(staticFiltersQuery({ excludedOwners: excluded }), { owner: '-x' })
  })
})
