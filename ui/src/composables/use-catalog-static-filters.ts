import type { StaticFilters } from '#portal/app/utils/catalog-static-filters'

// The manager preview shows mock topics, it never needs the parent catalog's filters
export const provideCatalogStaticFilters = (_source: 'datasets' | 'applications', _filters: () => StaticFilters | undefined) => {}
export const useParentCatalogStaticFilters = (): { source: 'datasets' | 'applications', filters: () => StaticFilters | undefined } | undefined => undefined
