import { mongoPagination, mongoProjection, mongoSort, type SessionStateAuthenticated } from '@data-fair/lib-express'
import { httpError } from '@data-fair/lib-utils/http-errors.js'

/**
 * Build a mongo filter from the `owner` query parameter, in the
 * `type:id:dep[,...]` format used by data-fair.
 *
 * - department `*` (or omitted) → any department
 * - department `-` → no department (org-root)
 * - leading `-` on type → negation
 */
export const ownerFilters = (reqQuery: Record<string, string>) => {
  const or: any[] = []
  const nor: any[] = []
  for (const ownerStr of reqQuery.owner.split(',')) {
    const [typ, id, dep] = ownerStr.split(':')
    const filter: Record<string, any> = { 'owner.type': typ.replace('-', ''), 'owner.id': id }
    if (!dep || dep === '*') {
      // no department filter to apply
    } else if (dep === '-') {
      filter['owner.department'] = { $exists: false }
    } else {
      filter['owner.department'] = dep
    }
    if (typ.startsWith('-')) nor.push(filter)
    else or.push(filter)
  }
  const and: any[] = []
  if (or.length) and.push({ $or: or })
  if (nor.length) and.push({ $nor: nor })
  return and
}

/**
 * Show all if super admin, otherwise filter by owner.
 *
 * When `contributorDepartments` is true, also include org-root resources whose
 * `contributorDepartments` array contains the session's department.
 *
 * When the caller passes a `owner` query parameter (data-fair format
 * `type:id:dep`), it is applied as an extra restriction on top of the
 * session's permission filter and the contributorDepartments inclusion is
 * skipped - this is how the portals list page narrows the listing to portals
 * actually owned by the session's account.
 */
export const filterPermissions = (
  reqQuery: Record<string, string>,
  sessionState: SessionStateAuthenticated,
  options: { contributorDepartments?: boolean } = {}
) => {
  const query: Record<string, any> = {}

  const showAll = reqQuery.showAll === 'true'
  if (showAll && !sessionState.user.adminMode) throw httpError(403, 'only super admins can use showAll parameter')

  if (!showAll) {
    query['owner.type'] = sessionState.account.type
    query['owner.id'] = sessionState.account.id
    if (sessionState.account.department) {
      if (options.contributorDepartments && !reqQuery.owner) {
        query.$or = [
          { 'owner.department': sessionState.account.department },
          { 'owner.department': { $exists: false }, contributorDepartments: sessionState.account.department }
        ]
      } else {
        query['owner.department'] = sessionState.account.department
      }
    }
  }

  if (reqQuery.owner) {
    query.$and = ownerFilters(reqQuery)
  }

  return query
}

/**
 * Generate a MongoDB query from the request query parameters
 * Use q reqQuery parameter to a text search
 * @param reqQuery The request query parameters
 * @param fieldsMap The mapping of request query parameters to MongoDB fields
 */
export const query = (reqQuery: Record<string, string>, fieldsMap: Record<string, string> = {}) => {
  const query: Record<string, any> = {}

  if (reqQuery.q) query.$text = { $search: reqQuery.q }

  Object.keys(fieldsMap).filter(name => reqQuery[name] !== undefined).forEach(name => {
    query[fieldsMap[name]] = { $in: reqQuery[name].split(',') }
  })
  return query
}

export default {
  query,
  filterPermissions,
  sort: mongoSort,
  pagination: mongoPagination,
  project: mongoProjection
}
