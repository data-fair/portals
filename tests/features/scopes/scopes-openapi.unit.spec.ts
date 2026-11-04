import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { validateVocabulary } from '@data-fair/openapi-mcp'
import apiDocs, { anyScopeSessionSecurity } from '../../../api/contract/api-docs.ts'
import { scopedOperations, imageOperations, anyScopeRoutes } from '../../../api/src/scopes.ts'

const httpMethods = ['get', 'put', 'post', 'delete', 'patch']
// the any-scope routes of the document that need a session
const sessionAnyScopePaths = ['/fonts']

// The x-agent keys data-fair's platform merge keeps (agentEntryKeys / agentTagKeys / agentSkillKeys
// of its api/contract/platform-api-docs.ts, pinned there to openapi-mcp's vocabulary): a key
// outside them is removed from this document by the merge, with a warning.
const agentEntryKeys = ['name', 'title', 'description', 'examples', 'annotations', 'params', 'fixed', 'body', 'bodyFields', 'bodyRequired', 'response', 'editor', 'security']
const agentTagKeys = ['guide']
const agentSkillKeys = ['name', 'description', 'href', 'body', 'tools']

const operationsOf = (doc: any) => Object.entries<any>(doc.paths).flatMap(([path, item]) =>
  httpMethods.filter(method => item[method]).map(method => ({ path, method, op: item[method] })))

const agentEntries = (op: any): any[] => [op['x-agent'] ?? []].flat()

test.describe('openapi document and the scopes', () => {
  test('the key lists are part of openapi-mcp vocabulary', () => {
    const unknownIn = (doc: any) => {
      try {
        validateVocabulary(doc)
        return []
      } catch (err: any) {
        return [...err.message.matchAll(/\(([^)]+)\)/g)].map(match => match[1])
      }
    }
    const garbage = (keys: string[]) => Object.fromEntries(keys.map(key => [key, Symbol('not json')]))
    assert.deepEqual(unknownIn({ paths: { '/a': { get: { 'x-agent': garbage(agentEntryKeys) } } } }), [])
    assert.deepEqual(unknownIn({ tags: [{ name: 'a', 'x-agent': garbage(agentTagKeys) }] }), [])
    assert.deepEqual(unknownIn({ 'x-agent': { skills: [garbage(agentSkillKeys)] } }), [])
    assert.deepEqual(unknownIn({ paths: { '/a': { get: { 'x-agent': { profiles: [] } } } } }), ['profiles'])
  })

  test('only the platform x-agent keys are used', () => {
    const doc: any = apiDocs('en')
    validateVocabulary(doc)
    for (const { path, method, op } of operationsOf(doc)) {
      for (const entry of agentEntries(op)) {
        assert.deepEqual(Object.keys(entry).filter(key => !agentEntryKeys.includes(key)), [], `${method} ${path}`)
      }
    }
    for (const tag of doc.tags) {
      assert.deepEqual(Object.keys(tag['x-agent'] ?? {}).filter(key => !agentTagKeys.includes(key)), [], tag.name)
    }
    assert.deepEqual(Object.keys(doc['x-agent'] ?? {}).filter(key => key !== 'skills'), [])
    for (const skill of doc['x-agent']?.skills ?? []) {
      assert.deepEqual(Object.keys(skill).filter(key => !agentSkillKeys.includes(key)), [], skill.name)
    }
  })

  test('every scope required is declared by the oauth2 scheme', () => {
    const doc: any = apiDocs('en')
    const declared = Object.keys(doc.components.securitySchemes.oauth2.flows.clientCredentials.scopes)
    assert.ok(declared.includes('pages:write'))
    assert.ok(declared.includes('all:admin'))
    assert.equal(doc.components.securitySchemes.apiKey, undefined, 'portals accepts no API keys')
    assert.deepEqual(doc.components.securitySchemes.sdCookie, { type: 'apiKey', in: 'cookie', name: 'id_token' })
    const schemes = Object.keys(doc.components.securitySchemes)
    for (const { path, method, op } of operationsOf(doc)) {
      const lists = [op.security, ...agentEntries(op).map(entry => entry.security)].filter(Boolean)
      assert.ok(op.security, `${method} ${path} declares its security`)
      for (const requirement of lists.flat()) {
        for (const [scheme, scopes] of Object.entries<string[]>(requirement)) {
          assert.ok(schemes.includes(scheme), `${method} ${path}: unknown scheme ${scheme}`)
          for (const scope of scopes) assert.ok(declared.includes(scope), `${method} ${path}: undeclared scope ${scope}`)
        }
      }
    }
  })

  test('every scoped, image and any-scope operation is in the document with its operationId', () => {
    const doc: any = apiDocs('en')
    const operations = operationsOf(doc)
    for (const [operationId, { method, path }] of Object.entries({ ...scopedOperations, ...imageOperations })) {
      const found = operations.find(o => o.method === method && o.path === path)
      assert.ok(found, `${method} ${path} is in the document`)
      assert.equal(found.op.operationId, operationId, `${method} ${path}`)
      assert.ok(found.op.security.some((r: any) => r.oauth2), `${operationId} is reachable by a scoped token`)
    }
    for (const { path, method, op } of operations) {
      const known = [...Object.values(scopedOperations), ...Object.values(imageOperations), ...anyScopeRoutes]
        .some(o => o.method === method && o.path === path)
      assert.ok(known, `${method} ${path} is a guarded or any-scope route`)
      if (anyScopeRoutes.some(o => o.method === method && o.path === path)) {
        // public, or a session whatever its scopes (/fonts lists the fonts of the active account)
        if (sessionAnyScopePaths.includes(path)) assert.deepEqual(op.security, anyScopeSessionSecurity, `${method} ${path} needs a session, any scope`)
        else assert.deepEqual(op.security, [], `${method} ${path} is public`)
      }
    }
  })

  test('operationIds are unique', () => {
    const ids = operationsOf(apiDocs('en')).map(o => o.op.operationId)
    assert.ok(ids.every(Boolean), 'every operation has an id')
    assert.equal(new Set(ids).size, ids.length)
  })

  test('the scope descriptions follow the locale', () => {
    const fr: any = apiDocs('fr')
    const en: any = apiDocs()
    assert.deepEqual(fr, en, 'fr is the default locale')
    assert.notEqual(
      apiDocs('en').components.securitySchemes.oauth2.flows.clientCredentials.scopes['pages:read'],
      fr.components.securitySchemes.oauth2.flows.clientCredentials.scopes['pages:read']
    )
  })
})
