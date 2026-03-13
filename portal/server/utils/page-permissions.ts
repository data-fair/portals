import type { Page } from '#api/types/page/index.ts'
import type { AccessRef } from '#api/types/access-ref/index.ts'
import type { SessionState, SessionStateAuthenticated } from '@data-fair/lib-common-types/session/index.js'

/**
 * Check if the current session matches an access ref.
 * Mirror of matchAccessRef from api/src/utils/permissions.ts.
 */
const matchAccessRef = (session: SessionStateAuthenticated, accessRef: AccessRef): boolean => {
  if (accessRef.type === 'user') {
    if (accessRef.id) return session.user.id === accessRef.id
    if (accessRef.email) return session.user.email === accessRef.email
    return false
  }
  if (accessRef.type === 'organization') {
    if (session.account.type !== 'organization') return false
    if (session.account.id !== accessRef.id) return false
    if (accessRef.department && accessRef.department !== '*' && session.account.department !== accessRef.department) return false
    if (accessRef.roles && accessRef.roles.length > 0 && !accessRef.roles.includes(session.accountRole)) return false
    return true
  }
  return false
}

/**
 * Returns conditions to spread into a MongoDB $elemMatch for permissions array.
 * Mirror of mongoFilterAccessRef from api/src/utils/permissions.ts.
 *
 * @example
 *   { permissions: { $elemMatch: { ...mongoFilterAccessRef(session), operation: { $in: ['read'] } } } }
 */
const mongoFilterAccessRef = (session: SessionStateAuthenticated): Record<string, unknown> => {
  const userFilter: { $or: Record<string, unknown>[] } = {
    $or: [
      { 'access.type': 'user', 'access.id': session.user.id },
      { 'access.type': 'user', 'access.email': session.user.email }
    ]
  }

  if (session.account.type === 'user') return userFilter

  const baseOrgFilter: Record<string, unknown> = {
    'access.type': 'organization',
    'access.id': session.account.id,
    $or: [
      { 'access.roles': { $size: 0 } },
      { 'access.roles': { $in: [session.accountRole] } }
    ]
  }
  if (session.account.department) baseOrgFilter['access.department'] = { $in: ['*', session.account.department] }
  else baseOrgFilter['access.department'] = { $in: ['-', '*'] }

  userFilter.$or.push(baseOrgFilter)
  return userFilter
}

/**
 * Checks if a portal visitor can read a page (in-memory).
 * Returns: 'allowed' | 'unauthenticated' | 'forbidden'
 */
export const checkPageAccess = (
  session: SessionState | null | undefined,
  page: Pick<Page, 'public' | 'permissions'>
): 'allowed' | 'unauthenticated' | 'forbidden' => {
  if (page.public) return 'allowed'
  if (!session?.user) return 'unauthenticated'
  const permissions = page.permissions ?? []
  const hasPermission = permissions.some(perm =>
    perm.operation.includes('read') && matchAccessRef(session as SessionStateAuthenticated, perm.access)
  )
  return hasPermission ? 'allowed' : 'forbidden'
}

/**
 * Builds the MongoDB filter for pages readable by the portal visitor.
 * - No session (unauthenticated): only public pages
 * - Authenticated session: public pages OR explicit read permission
 */
export const buildPortalPagePermissionQuery = (session: SessionState | null | undefined): Record<string, unknown> => {
  if (!session?.user || !session?.account || !session?.accountRole) {
    return { public: true }
  }

  const accessFilter = mongoFilterAccessRef(session as SessionStateAuthenticated)

  return {
    $or: [
      { public: true },
      {
        permissions: {
          $elemMatch: {
            ...accessFilter,
            operation: { $in: ['read'] }
          }
        }
      }
    ]
  }
}
