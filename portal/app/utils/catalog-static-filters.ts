export type StaticFilterValue = { id: string, title?: string }

/** Static filters of a datasets or applications block, the keys absent from a source are just left out */
export type StaticFilters = {
  includedOwners?: StaticFilterValue[]
  excludedOwners?: StaticFilterValue[]
  includedTopics?: StaticFilterValue[]
  includedConcepts?: StaticFilterValue[]
  includedKeywords?: StaticFilterValue[]
  includedBaseApplications?: StaticFilterValue[]
  types?: string[]
}

/**
 * Value of a catalog query param combining the visitor's choices with the static filters
 * of the block: the visitor can only narrow the included values down, and the excluded
 * values are appended with a "-" prefix.
 */
export const staticFilterParam = (userValues?: string[], included: StaticFilterValue[] = [], excluded: StaticFilterValue[] = []) => {
  let values = userValues ?? []
  if (included.length) {
    const allowed = values.filter(value => included.some(v => v.id === value))
    values = allowed.length ? allowed : included.map(v => v.id)
  }
  const param = [...values, ...excluded.map(v => '-' + v.id)]
  return param.length ? param.join(',') : undefined
}

/** Whether a filter choice can be offered to the visitor given the static filters of the block */
export const isStaticFilterAllowed = (value: string, included: StaticFilterValue[] = [], excluded: StaticFilterValue[] = []) =>
  (!included.length || included.some(v => v.id === value)) && !excluded.some(v => v.id === value)

/** Whether at least one static filter holds a value: an emptied chips field leaves an empty array behind */
export const hasStaticFilters = (filters?: StaticFilters) =>
  !!filters && Object.values(filters).some(values => Array.isArray(values) && values.length > 0)

/** The block's own filters replace the inherited ones as a whole, they are never merged field by field */
export const resolveStaticFilters = (own?: StaticFilters, inherited?: StaticFilters) =>
  hasStaticFilters(own) ? own : inherited

/** data-fair query params of the static filters alone, without any visitor choice */
export const staticFiltersQuery = (filters?: StaticFilters) => {
  const query: Record<string, string | undefined> = {
    owner: staticFilterParam([], filters?.includedOwners, filters?.excludedOwners),
    topics: staticFilterParam([], filters?.includedTopics),
    concepts: staticFilterParam([], filters?.includedConcepts),
    keywords: staticFilterParam([], filters?.includedKeywords),
    'base-application': staticFilterParam([], filters?.includedBaseApplications),
    type: filters?.types?.length ? filters.types.join(',') : undefined
  }
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined)) as Record<string, string>
}
