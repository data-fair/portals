import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { acceptedScopes, scopeDescriptions, scopedOperations, operationTier, requireOperationScope } from '../../../api/src/scopes.ts'

test.describe('scope vocabulary', () => {
  test('a tier accepts itself, the higher tiers, the umbrella and the global tiers at or above it', () => {
    assert.deepEqual(acceptedScopes('pages', 'write').sort(), ['pages:write', 'pages:admin', 'pages', 'all:write', 'all:admin'].sort())
    const portalsRead = acceptedScopes('portals', 'read')
    assert.ok(portalsRead.includes('all:read'))
    assert.ok(!portalsRead.includes('pages:read'))
  })

  test('every scope is described, in both locales', () => {
    const keys = ['all:read', 'all:write', 'all:admin']
    for (const family of ['portals', 'pages', 'reuses']) keys.push(family, `${family}:read`, `${family}:write`, `${family}:admin`)
    for (const lang of ['fr', 'en'] as const) {
      const descriptions = scopeDescriptions(lang)
      assert.deepEqual(Object.keys(descriptions).sort(), [...keys].sort())
      for (const key of keys) assert.ok(descriptions[key], `${lang} ${key}`)
    }
    assert.notEqual(scopeDescriptions('fr').pages, scopeDescriptions('en').pages)
  })

  test('body properties raise the tier of an operation', () => {
    assert.equal(operationTier(scopedOperations.updatePage, { draftConfig: {} }), 'write')
    assert.equal(operationTier(scopedOperations.updatePage, { draftConfig: {}, portals: [] }), 'admin')
    assert.equal(operationTier(scopedOperations.updatePage, { owner: null }), 'admin')
    assert.equal(operationTier(scopedOperations.updatePortal, { contributorDepartments: [] }), 'admin')
    assert.equal(operationTier(scopedOperations.createReuse, { config: {} }), 'write')
    assert.equal(operationTier(scopedOperations.createReuse, { portals: ['p'] }), 'admin')
    // no body, a non object body: the declared tier
    assert.equal(operationTier(scopedOperations.updatePage, undefined), 'write')
    assert.equal(operationTier(scopedOperations.updatePage, 'portals'), 'write')
    assert.equal(operationTier(scopedOperations.deletePage, { portals: [] }), 'admin')
  })

  test('an unknown operation fails at declaration', () => {
    assert.throws(() => requireOperationScope('nope' as any))
  })
})
