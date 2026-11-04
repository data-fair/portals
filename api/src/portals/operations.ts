// operations.ts — pure functions only
// must not import #mongo, #config, or store state
import type { Portal } from '#types/portal/index.ts'
import { type SessionStateAuthenticated, assertAccountRole } from '@data-fair/lib-express'

export type SyncCredentials = { cookie?: string, authorization?: string }

// the same test as lib-express (assertRouteCheckedScope): a parsed scopes list or a raw scope claim
const isScopeRestricted = (session: SessionStateAuthenticated) => !!session.scopes || session.user.scope !== undefined

/**
 * How the publication site of a portal is synced to data-fair: an unrestricted session forwards
 * its cookie to data-fair's public url (data-fair subscribes the user itself), a scope-restricted
 * session (an agent's token, refused by data-fair on that route) goes through the secret key.
 */
// TODO: unify on the secret-key path once every supported data-fair has it
export const syncPath = (session: SessionStateAuthenticated): 'cookie' | 'secret' => isScopeRestricted(session) ? 'secret' : 'cookie'

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
