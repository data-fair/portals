import type { Page } from '#api/types/page/index.ts'
import type { SessionState } from '@data-fair/lib-common-types/session/index.js'
import { matchAccessRef, mongoFilterAccessRef } from '@data-fair/lib-common-types/access-ref/index.js'
import { getAccountRole, isAuthenticated } from '@data-fair/lib-common-types/session/index.js'

type AccountKeys = Pick<Page['owner'], 'type' | 'id' | 'department'>

/**
 * Checks if a portal visitor can read a page (in-memory).
 * Returns: 'allowed' | 'unauthenticated' | 'forbidden'
 */
export const checkPageAccess = (
  session: SessionState | null | undefined,
  page: Pick<Page, 'public' | 'permissions'>,
  owner: AccountKeys
): 'allowed' | 'unauthenticated' | 'forbidden' => {
  if (page.public) return 'allowed'
  if (!session || !isAuthenticated(session)) return 'unauthenticated'
  if (getAccountRole(session, owner) === 'admin') return 'allowed'
  const permissions = page.permissions ?? []
  const hasPermission = permissions.some(perm =>
    perm.operation.includes('read') && matchAccessRef(session, perm.access)
  )
  return hasPermission ? 'allowed' : 'forbidden'
}

/**
 * Builds the MongoDB filter for pages readable by the portal visitor.
 * - No session (unauthenticated): only public pages
 * - Admin of the portal owner: all pages (no filter)
 * - Authenticated session: public pages OR explicit read permission
 */
export const buildPortalPagePermissionQuery = (session: SessionState | null | undefined, portalOwner: AccountKeys): Record<string, unknown> => {
  if (!session || !isAuthenticated(session)) return { public: true }
  if (getAccountRole(session, portalOwner) === 'admin') return {}

  return {
    $or: [
      { public: true },
      {
        permissions: {
          $elemMatch: {
            ...mongoFilterAccessRef(session),
            operation: { $in: ['read'] }
          }
        }
      }
    ]
  }
}
