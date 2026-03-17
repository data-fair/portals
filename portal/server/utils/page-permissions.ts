import type { Page } from '#api/types/page/index.ts'
import type { SessionState, SessionStateAuthenticated } from '@data-fair/lib-common-types/session/index.js'
import { matchAccessRef, mongoFilterAccessRef } from '@data-fair/lib-common-types/access-ref/index.js'

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
