import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import type { SessionStateAuthenticated } from '@data-fair/lib-express'
import { syncPath, subscriptionRequests, assertCanSyncPortal, syncErrorStatus } from '../../../api/src/portals/operations.ts'

const org1 = { type: 'organization' as const, id: 'org1', name: 'Org 1' }

const orgSession = (role: string, extra: Partial<SessionStateAuthenticated> = {}, userExtra: Record<string, unknown> = {}): SessionStateAuthenticated => ({
  user: { id: 'u1', name: 'User 1', email: 'u1@test.com', organizations: [{ id: 'org1', name: 'Org 1', role }], ...userExtra },
  organization: { id: 'org1', name: 'Org 1', role },
  account: org1,
  accountRole: role,
  lang: 'fr',
  ...extra
})

test.describe('publication-site sync operations', () => {
  test('syncPath: cookie for unscoped cookie sessions, secret for bearer or scope-restricted ones', () => {
    const cookie = { cookie: 'id_token=x' }
    const bearer = { authorization: 'Bearer t' }
    assert.equal(syncPath(orgSession('admin'), cookie), 'cookie')
    assert.equal(syncPath(orgSession('admin', {}, { nhi: 1 }), cookie), 'cookie')
    assert.equal(syncPath(orgSession('admin', { scopes: ['portals:admin'] }, { nhi: 1, scope: 'portals:admin' }), cookie), 'secret')
    // a raw scope claim alone is enough to be scope-restricted (same test as lib-express)
    assert.equal(syncPath(orgSession('admin', {}, { scope: '' }), cookie), 'secret')
    assert.equal(syncPath(orgSession('admin', { scopes: [] }), cookie), 'secret')
    // a bearer session, scoped or not: its cookie (if any) is not the credential that was read
    assert.equal(syncPath(orgSession('admin'), bearer), 'secret')
    assert.equal(syncPath(orgSession('admin'), { ...cookie, ...bearer }), 'secret')
    assert.equal(syncPath(orgSession('admin', { scopes: ['portals:admin'] }, { nhi: 1, scope: 'portals:admin' }), bearer), 'secret')
  })

  test('subscriptionRequests: one request per subscription with only the caller credential', () => {
    const subscriptions = [{ topic: { key: 'a' } }, { topic: { key: 'b' } }]
    const origin = 'http://localhost:1234'

    const withCookie = subscriptionRequests({ created: true, subscriptions }, origin, { cookie: 'id_token=x' })
    assert.deepEqual(withCookie, subscriptions.map(body => ({
      url: `${origin}/events/api/v1/subscriptions`,
      body,
      headers: { cookie: 'id_token=x' }
    })))

    const withBearer = subscriptionRequests({ created: true, subscriptions }, origin, { authorization: 'Bearer t' })
    assert.deepEqual(withBearer.map(r => r.headers), [{ authorization: 'Bearer t' }, { authorization: 'Bearer t' }])

    // never both: the bearer is the credential lib-express reads first
    const withBoth = subscriptionRequests({ created: true, subscriptions }, origin, { cookie: 'id_token=x', authorization: 'Bearer t' })
    assert.deepEqual(withBoth.map(r => r.headers), [{ authorization: 'Bearer t' }, { authorization: 'Bearer t' }])

    assert.deepEqual(subscriptionRequests({ created: false, subscriptions }, origin, { cookie: 'id_token=x' }), [])
    assert.deepEqual(subscriptionRequests({ created: true, subscriptions: [] }, origin, { cookie: 'id_token=x' }), [])
  })

  test('assertCanSyncPortal: only an admin of the portal owner', () => {
    const portal = { owner: org1 }
    assertCanSyncPortal(orgSession('admin'), portal)
    assert.throws(() => assertCanSyncPortal(orgSession('contrib'), portal), (err: any) => err.status === 403)
    const otherOrg: SessionStateAuthenticated = {
      user: { id: 'u2', name: 'User 2', email: 'u2@test.com', organizations: [{ id: 'org2', name: 'Org 2', role: 'admin' }] },
      organization: { id: 'org2', name: 'Org 2', role: 'admin' },
      account: { type: 'organization', id: 'org2', name: 'Org 2' },
      accountRole: 'admin',
      lang: 'fr'
    }
    assert.throws(() => assertCanSyncPortal(otherOrg, portal), (err: any) => err.status === 403)
  })

  test('syncErrorStatus: the request errors pass through, the downstream failures are a bad gateway', () => {
    for (const status of [400, 403, 404, 409]) assert.equal(syncErrorStatus(status), status)
    for (const status of [401, 500, 502, 503]) assert.equal(syncErrorStatus(status), 502)
    // a network error has no status
    assert.equal(syncErrorStatus(undefined), 502)
  })
})
