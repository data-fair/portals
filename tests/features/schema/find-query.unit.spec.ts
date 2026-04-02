import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { query } from '../../../api/src/utils/find.ts'

test.describe('query builder', () => {
  test('should return empty query for empty params', () => {
    const result = query({})
    assert.deepEqual(result, {})
  })

  test('should add text search when q param is present', () => {
    const result = query({ q: 'hello world' })
    assert.deepEqual(result, { $text: { $search: 'hello world' } })
  })

  test('should map field filters using fieldsMap', () => {
    const result = query({ type: 'home,generic' }, { type: 'config.type' })
    assert.deepEqual(result, { 'config.type': { $in: ['home', 'generic'] } })
  })

  test('should combine text search and field filters', () => {
    const result = query({ q: 'test', type: 'home' }, { type: 'config.type' })
    assert.deepEqual(result, {
      $text: { $search: 'test' },
      'config.type': { $in: ['home'] }
    })
  })

  test('should ignore unmapped query params', () => {
    const result = query({ unknown: 'value', type: 'home' }, { type: 'config.type' })
    assert.deepEqual(result, { 'config.type': { $in: ['home'] } })
  })
})
