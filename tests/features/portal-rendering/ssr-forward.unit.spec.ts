import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { ssrTarget, ssrForwardHeaders, proxyLookupTarget } from '../../../portal/app/utils/ssr-forward.ts'

test.describe('ssr calls to our services', () => {
  test('go to the site\'s own origin without an upstream proxy', () => {
    assert.deepEqual(ssrTarget('https://portal.test'), { baseURL: 'https://portal.test', headers: {} })
  })
  // fetch drops an explicit Host header: the URL keeps the site's host name (resolved to the proxy by
  // the dispatcher, see proxyLookupTarget) on the proxy's port, in plain http
  test('go through the upstream proxy, the site kept in X-Forwarded-Host/-Proto', () => {
    assert.deepEqual(ssrTarget('https://portal.test', 'haproxy1-nginx.default.svc.cluster.local:8080'), {
      baseURL: 'http://portal.test:8080',
      headers: { 'x-forwarded-host': 'portal.test', 'x-forwarded-proto': 'https' }
    })
    assert.deepEqual(ssrTarget('https://portal.test:8443', 'l2:80').headers, { 'x-forwarded-host': 'portal.test:8443', 'x-forwarded-proto': 'https' })
  })
  test('parse the upstream proxy host the dispatcher resolves every site to', () => {
    assert.deepEqual(proxyLookupTarget('haproxy1-nginx.default.svc.cluster.local:80'), { host: 'haproxy1-nginx.default.svc.cluster.local', port: 80 })
    assert.deepEqual(proxyLookupTarget('l2'), { host: 'l2', port: 80 })
  })
  test('carry the visitor\'s IP and the forwarder secret', () => {
    assert.deepEqual(ssrForwardHeaders('203.0.113.7', 'tf'), { 'x-forwarded-for': '203.0.113.7', 'x-trusted-forwarder': 'tf' })
  })
  test('carry no IP when the render has none, and no secret when none is configured', () => {
    assert.deepEqual(ssrForwardHeaders(undefined, undefined), {})
  })
  // TODO: remove with the legacy ignore secret, once data-fair and the ingresses no longer honour
  // x-ignore-rate-limiting (data-fair docs/architecture/agent-rate-limiting.md, step 7)
  test('still carry the legacy ignore secret when it is configured', () => {
    assert.deepEqual(ssrForwardHeaders(undefined, undefined, 'ign'), { 'x-ignore-rate-limiting': 'ign' })
    assert.deepEqual(ssrForwardHeaders('203.0.113.7', 'tf', 'ign'), { 'x-forwarded-for': '203.0.113.7', 'x-trusted-forwarder': 'tf', 'x-ignore-rate-limiting': 'ign' })
  })
})
