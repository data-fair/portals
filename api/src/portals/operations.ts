// operations.ts — pure functions only
// must not import #mongo, #config, or store state
import type { Portal } from '#types/portal/index.ts'
import { type SessionStateAuthenticated, assertAccountRole } from '@data-fair/lib-express'

export type SyncCredentials = { cookie?: string, authorization?: string }

// the caller's credentials, forwarded by the syncs that act as the caller (data-fair, events)
export const syncHeaders = (req: { headers: SyncCredentials }): SyncCredentials => ({ cookie: req.headers.cookie, authorization: req.headers.authorization })

// the same test as lib-express (assertRouteCheckedScope): a parsed scopes list or a raw scope claim
const isScopeRestricted = (session: SessionStateAuthenticated) => !!session.scopes || session.user.scope !== undefined

/**
 * How the publication site of a portal is synced to data-fair: a cookie session forwards its cookie
 * to data-fair's public url (data-fair subscribes the user itself); a bearer session (the cookie
 * would not be the credential lib-express read) or a scope-restricted one (an agent's token, refused
 * by data-fair on that route) goes through the secret key.
 */
// TODO: unify on the secret-key path once every supported data-fair has it
export const syncPath = (session: SessionStateAuthenticated, headers: SyncCredentials): 'cookie' | 'secret' =>
  (headers.authorization || isScopeRestricted(session)) ? 'secret' : 'cookie'

/**
 * The first of the portal ids a page or reuse of `owner` may not be attached to: a portal not
 * found, or owned by another account. A portal only shows the pages and reuses of its owner
 * (type and id: the department may differ, see contributorDepartments), and attaching a
 * standard page detaches the one of the same type: across owners, that would detach the page
 * of another account.
 */
export const foreignPortalId = (
  owner: { type: string, id: string },
  portalIds: string[],
  portals: Pick<Portal, '_id' | 'owner'>[]
): string | undefined => portalIds.find(portalId => {
  const portal = portals.find(p => p._id === portalId)
  return !portal || portal.owner.type !== owner.type || portal.owner.id !== owner.id
})

/**
 * The status portals answers for a failed sync call: the downstream 4xx that tell the caller
 * something about its request (400, 403, 404, 409...) pass through; a 401 (portals' own credential
 * to the service was refused), a 5xx and a network error (no status) are a bad gateway.
 */
export const syncErrorStatus = (downstreamStatus?: number): number => {
  if (!downstreamStatus || downstreamStatus === 401 || downstreamStatus >= 500) return 502
  return downstreamStatus
}

/** the caller of a sync must be admin of the portal owner (also asserted by getPortalAsAdmin) */
export const assertCanSyncPortal = (session: SessionStateAuthenticated, portal: Pick<Portal, 'owner'>): void => {
  assertAccountRole(session, portal.owner, 'admin')
}

/**
 * The events subscriptions data-fair returns when the secret-key path creates a publication site,
 * to post with the caller's own credential: its bearer (read first by lib-express) or its cookie.
 */
export const subscriptionRequests = (
  response: { created: boolean, subscriptions?: unknown[] },
  reqOrigin: string,
  headers: SyncCredentials
): { url: string, body: unknown, headers: Record<string, string> }[] => {
  if (!response.created || !response.subscriptions?.length) return []
  const credential: Record<string, string> = headers.authorization
    ? { authorization: headers.authorization }
    : headers.cookie ? { cookie: headers.cookie } : {}
  return response.subscriptions.map(body => ({ url: `${reqOrigin}/events/api/v1/subscriptions`, body, headers: { ...credential } }))
}
