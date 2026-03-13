import type { Page, PageElement } from '#types/page/index.ts'
import { getAccountRole, type SessionStateAuthenticated } from '@data-fair/lib-express'
import { matchAccessRef, mongoFilterAccessRef } from '../utils/permissions.ts'

export const traversePageElements = async (
  pageElements: PageElement[] | undefined,
  callback: (pageElement: PageElement) => Promise<void> | void
) => {
  if (!pageElements) return
  for (const element of pageElements) {
    await callback(element)
    if (element.type === 'card') await traversePageElements(element.children, callback)
    if (element.type === 'banner') await traversePageElements(element.children, callback)
    if (element.type === 'responsive-grid') await traversePageElements(element.children, callback)
    if (element.type === 'datasets-catalog') await traversePageElements(element.advancedFilters, callback)
    if (element.type === 'applications-catalog') await traversePageElements(element.advancedFilters, callback)
    if (element.type === 'reuses-catalog') await traversePageElements(element.advancedFilters, callback)

    if (element.type === 'two-columns') {
      await traversePageElements(element.children, callback)
      await traversePageElements(element.children2, callback)
    }

    if (element.type === 'tabs') {
      for (const tab of element.tabs) {
        await traversePageElements(tab.children, callback)
      }
    }

    if (element.type === 'expansion-panels') {
      for (const tab of element.panels) {
        await traversePageElements(tab.children, callback)
      }
    }
  }
}

export const canReadPage = (session: SessionStateAuthenticated, page: Page): boolean => {
  const accountRole = getAccountRole(session, page.owner, { acceptDepAsRoot: true })
  if (accountRole === 'admin') return true
  if (page.public) return true
  const permissions = page.permissions ?? []
  return permissions.some(perm =>
    perm.operation.includes('read') && matchAccessRef(session, perm.access)
  )
}

export const canWritePage = (session: SessionStateAuthenticated, page: Page): boolean => {
  const accountRole = getAccountRole(session, page.owner, { acceptDepAsRoot: true })
  if (accountRole === 'admin') return true
  const permissions = page.permissions ?? []
  return permissions.some(perm =>
    perm.operation.includes('write') && matchAccessRef(session, perm.access)
  )
}

export const buildPageAccessFilter = (session: SessionStateAuthenticated): Record<string, any> => {
  return {
    $or: [
      { public: true },
      {
        permissions: {
          $elemMatch: {
            ...mongoFilterAccessRef(session),
            operation: 'read'
          }
        }
      }
    ]
  }
}

export const buildDefaultPermissions = (
  session: SessionStateAuthenticated,
  owner: SessionStateAuthenticated['account']
): Page['permissions'] => {
  const ownerRole = getAccountRole(session, owner, { acceptDepAsRoot: true })
  if (ownerRole === 'contrib' && owner.type === 'organization') {
    return [{
      access: {
        mode: 'internal',
        type: 'organization',
        id: owner.id,
        department: owner.department || '*',
        roles: ['contrib']
      },
      operation: ['read', 'write']
    }]
  }
  return []
}
