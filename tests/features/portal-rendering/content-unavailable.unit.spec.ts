import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { isContentUnavailable } from '../../../portal/app/utils/content-unavailable.ts'

test.describe('content unavailable detection', () => {
  test('no error means the content is available', () => {
    assert.equal(isContentUnavailable(null), false)
    assert.equal(isContentUnavailable(undefined), false)
  })

  test('a network error or timeout has no status code and means unavailable', () => {
    assert.equal(isContentUnavailable({}), true)
    assert.equal(isContentUnavailable({ statusCode: undefined }), true)
  })

  test('server errors mean unavailable', () => {
    assert.equal(isContentUnavailable({ statusCode: 500 }), true)
    assert.equal(isContentUnavailable({ statusCode: 502 }), true)
    assert.equal(isContentUnavailable({ statusCode: 503 }), true)
  })

  test('client errors are legitimate answers, not an outage', () => {
    assert.equal(isContentUnavailable({ statusCode: 401 }), false)
    assert.equal(isContentUnavailable({ statusCode: 403 }), false)
    assert.equal(isContentUnavailable({ statusCode: 404 }), false)
  })
})
