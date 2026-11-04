import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { scopedOperations, imageOperations, anyScopeRoutes, refusedRoutes } from '../../../api/src/scopes.ts'

type ListedRoute = { method: string, path: string, guards: string[], before: string[], lastIsGuard: boolean }

// the api modules need the config, the routes are listed in a node process of their own
const listRoutes = (): { routes: ListedRoute[], errors: string[] } => JSON.parse(execFileSync(
  process.execPath,
  ['tests/support/list-api-routes.ts'],
  { env: { ...process.env, NODE_CONFIG_DIR: './api/config/', NODE_ENV: 'development' }, encoding: 'utf8' }
))

const refused = (route: ListedRoute) => refusedRoutes.some(r => {
  if (r.method !== '*' && r.method !== route.method) return false
  if (r.path.endsWith('/*')) {
    const prefix = r.path.slice(0, -2)
    return route.path === prefix || route.path.startsWith(prefix + '/')
  }
  return r.path === route.path
})

test.describe('scopes coverage', () => {
  test('every manager route is scoped, marked or refused on purpose', () => {
    test.slow()
    const { routes, errors } = listRoutes()
    assert.deepEqual(errors, [])
    assert.ok(routes.length > 30, 'routes were listed')
    const seen = new Set<string>()
    for (const route of routes) {
      const key = `${route.method} ${route.path}`
      assert.ok(!seen.has(key), `${key} declared twice`)
      seen.add(key)
      assert.ok(!route.lastIsGuard, `${key}: a guard is not a route handler`)
      const operation = Object.entries(scopedOperations).find(([, op]) => op.method === route.method && op.path === route.path)
      const imageOperation = Object.values(imageOperations).find(op => op.method === route.method && op.path === route.path)
      if (operation) assert.deepEqual(route.guards, [`operation:${operation[0]}`], key)
      else if (imageOperation) assert.deepEqual(route.guards, ['image'], key)
      else if (anyScopeRoutes.some(r => r.method === route.method && r.path === route.path)) assert.deepEqual(route.guards, ['any'], key)
      else if (refused(route)) assert.deepEqual(route.guards, [], `${key} is refused on purpose, it has no guard`)
      else assert.fail(`${key} is neither scoped, marked nor refused on purpose`)
    }
    // the guard runs before any handler that could read the session or write; the image upload needs
    // the multipart body to pick the family, its guard comes right after the parsers
    for (const route of routes.filter(r => r.guards.length)) {
      const key = `${route.method} ${route.path}`
      const expected = key === 'post /images' ? ['multerMiddleware', 'jsonFromMultiPart', 'mutableQuery'] : []
      assert.deepEqual(route.before, expected, `${key}: handlers before the scope guard`)
    }
    for (const op of [...Object.values(scopedOperations), ...Object.values(imageOperations), ...anyScopeRoutes]) {
      assert.ok(seen.has(`${op.method} ${op.path}`), `${op.method} ${op.path} is not a route`)
    }
  })
})
