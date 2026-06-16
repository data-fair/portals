import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { toAbsoluteUrl, toRoutePath } from '../../../portal/app/composables/agent/url-utils.ts'

const ORIGIN = 'https://portal.example.com'

test.describe('toAbsoluteUrl', () => {
  test('prefixes origin to a router path when base is root', () => {
    assert.equal(toAbsoluteUrl(ORIGIN, '/', '/datasets/my-dataset/table'), 'https://portal.example.com/datasets/my-dataset/table')
  })

  test('prefixes origin + base to a router path', () => {
    assert.equal(toAbsoluteUrl(ORIGIN, '/portal/', '/datasets/abc/map'), 'https://portal.example.com/portal/datasets/abc/map')
  })

  test('keeps {slug} templates intact (no URL parsing/encoding)', () => {
    assert.equal(toAbsoluteUrl(ORIGIN, '/', '/datasets/{slug}'), 'https://portal.example.com/datasets/{slug}')
  })

  test('adds a missing leading slash to the path', () => {
    assert.equal(toAbsoluteUrl(ORIGIN, '/', 'datasets'), 'https://portal.example.com/datasets')
  })
})

test.describe('toRoutePath', () => {
  test('strips origin from a full absolute URL (root base)', () => {
    assert.deepEqual(toRoutePath(ORIGIN, '/', 'https://portal.example.com/datasets/abc/table'), { path: '/datasets/abc/table', query: undefined })
  })

  test('preserves the embedded query string', () => {
    assert.deepEqual(
      toRoutePath(ORIGIN, '/', 'https://portal.example.com/datasets/abc/table?ville_eq=Paris&_c_q=foo'),
      { path: '/datasets/abc/table', query: 'ville_eq=Paris&_c_q=foo' }
    )
  })

  test('strips the base from a base-prefixed path', () => {
    assert.deepEqual(toRoutePath(ORIGIN, '/portal/', '/portal/datasets/abc'), { path: '/datasets/abc', query: undefined })
  })

  test('leaves a bare base-less router path unchanged (backward compat)', () => {
    assert.deepEqual(toRoutePath(ORIGIN, '/portal/', '/datasets/abc'), { path: '/datasets/abc', query: undefined })
  })

  test('recovers the path from a wrong/hallucinated origin', () => {
    assert.deepEqual(toRoutePath(ORIGIN, '/', 'https://wrong.example.org/datasets/abc'), { path: '/datasets/abc', query: undefined })
  })

  test('maps the base root to "/"', () => {
    assert.deepEqual(toRoutePath(ORIGIN, '/portal/', 'https://portal.example.com/portal'), { path: '/', query: undefined })
  })
})
