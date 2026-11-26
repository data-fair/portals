import * as catalogStaticFilters from '#portal/app/utils/catalog-static-filters'

// Local const re-declarations (not `export ... from`) so unplugin-auto-import also emits the
// declarations, cf utils/hover.ts
export const staticFilterParam = catalogStaticFilters.staticFilterParam
export const isStaticFilterAllowed = catalogStaticFilters.isStaticFilterAllowed
export const hasStaticFilters = catalogStaticFilters.hasStaticFilters
export const resolveStaticFilters = catalogStaticFilters.resolveStaticFilters
export const staticFiltersQuery = catalogStaticFilters.staticFiltersQuery
