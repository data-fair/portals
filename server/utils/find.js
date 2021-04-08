const createError = require('http-errors')
const permissions = require('./permissions')

// Util functions shared accross the main find (GET on collection) endpoints

function queryVal(val) {
  if (val === 'true') return true
  if (val === 'false') return false
  return val
}

exports.query = (req, fieldsMap, forceShowAll) => {
  const query = {}
  if (!req.query) return query

  if (req.query.q) {
    query.$text = {
      $search: req.query.q,
    }
  }

  Object.keys(fieldsMap).filter(name => req.query[name] !== undefined).forEach(name => {
    query[fieldsMap[name]] = { $in: req.query[name].split(',').map(queryVal) }
  })

  let showAll = req.query.showAll === 'true'
  if (showAll && !req.user.adminMode) throw createError(400, 'Only super admins can override permissions filter with showAll parameter')
  showAll = showAll || forceShowAll
  query.$and = []
  if (!showAll) {
    query.$and.push({ $or: permissions.filter(req.user) })
  }
  if (req.query.owner && !forceShowAll) {
    delete query['owner.type']
    delete query['owner.id']
    query.$and.push({ $or: exports.ownerFilters(req.query) })
  }
  if (!query.$and.length) delete query.$and
  return query
}

exports.ownerFilters = (reqQuery) => {
  const ownerTypes = {}
  reqQuery.owner.split(',').forEach(owner => {
    const [t, id] = owner.split(':')
    ownerTypes[t] = ownerTypes[t] || []
    ownerTypes[t].push(id)
  })
  let ownerFilters = ['user', 'organization'].filter(t => ownerTypes[t]).map(t => ({ 'owner.type': t, 'owner.id': { $in: ownerTypes[t] } }))
  if (ownerTypes['-user'] || ownerTypes['-organization']) {
    ownerFilters = ownerFilters.concat(['-user', '-organization'].map(t => {
      const f = { 'owner.type': t.substring(1) }
      if (ownerTypes[t]) f['owner.id'] = { $nin: ownerTypes[t] }
      return f
    }))
  }
  return ownerFilters
}

exports.sort = (sortStr) => {
  const sort = {}
  if (!sortStr) return sort
  sortStr.split(',').forEach(s => {
    const toks = s.split(':')
    sort[toks[0]] = Number(toks[1])
  })
  return sort
}

exports.pagination = (query, defaultSize = 10) => {
  let size = defaultSize
  if (query && query.size && !isNaN(parseInt(query.size))) {
    size = parseInt(query.size)
  }

  let skip = 0
  if (query && query.skip && !isNaN(parseInt(query.skip))) {
    skip = parseInt(query.skip)
  } else if (query && query.page && !isNaN(parseInt(query.page))) {
    skip = (parseInt(query.page) - 1) * size
  }

  return [skip, size]
}

exports.project = (selectStr, exclude = []) => {
  const select = { _id: 0 }
  if (!selectStr) {
    exclude.forEach(e => {
      select[e] = 0
    })
  } else {
    selectStr.split(',').forEach(s => {
      select[s] = 1
    })
    Object.assign(select, { permissions: 1, id: 1, owner: 1 })
    exclude.forEach(e => {
      delete select[e]
    })
  }
  return select
}
