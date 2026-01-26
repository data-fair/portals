import { mongoPagination, mongoProjection, mongoSort, type SessionStateAuthenticated } from '@data-fair/lib-express'
import { httpError } from '@data-fair/lib-utils/http-errors.js'

/**
 * Show all if super admin, otherwise filter by owner
 */
export const filterPermissions = (reqQuery: Record<string, string>, sessionState: SessionStateAuthenticated) => {
  const query: Record<string, any> = {}

  const showAll = reqQuery.showAll === 'true' || reqQuery.showAll === '1'
  if (showAll && !sessionState.user.adminMode) throw httpError(403, 'only super admins can use showAll parameter')

  if (!showAll) {
    query['owner.type'] = sessionState.account.type
    query['owner.id'] = sessionState.account.id
    if (sessionState.account.department) query['owner.department'] = sessionState.account.department
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
