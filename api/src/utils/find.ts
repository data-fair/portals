import { mongoPagination, mongoProjection, mongoSort, type SessionStateAuthenticated } from '@data-fair/lib-express'
import { httpError } from '@data-fair/lib-utils/http-errors.js'

/**
 * Show all if super admin, otherwise filter by owner (or submitter for reuses)
 */
export const filterPermissions = (reqQuery: Record<string, string>, sessionState: SessionStateAuthenticated) => {
  const query: Record<string, any> = {}

  const showAll = reqQuery.showAll === 'true'
  const filterSubmitter = reqQuery.submitter === 'true' // For reuses

  if (showAll && !sessionState.user.adminMode) {
    throw httpError(403, 'Only super admins can use showAll parameter')
  }

  if (filterSubmitter) { // Filter by submitter instead of owner
    // For the moment, reuses are submitted by users only
    query['submitter.type'] = 'user'
    query['submitter.id'] = sessionState.user.id

    // query['submitter.type'] = sessionState.account.type
    // query['submitter.id'] = sessionState.account.id
    // if (sessionState.account.department) query['submitter.department'] = sessionState.account.department
  } else if (!showAll) { // Default: filter by owner
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
