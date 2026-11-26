import type { StaticFilters } from '~/utils/catalog-static-filters'

type CatalogSource = 'datasets' | 'applications'
type CatalogStaticFilters = { source: CatalogSource, filters: () => StaticFilters | undefined }

const catalogStaticFiltersKey = Symbol('catalog-static-filters')

/** Lets the blocks of a catalog's advanced filters restrict themselves like the catalog */
export const provideCatalogStaticFilters = (source: CatalogSource, filters: () => StaticFilters | undefined) => {
  provide<CatalogStaticFilters>(catalogStaticFiltersKey, { source, filters })
}

/** The static filters of the catalog holding this block, undefined outside a catalog */
export const useParentCatalogStaticFilters = () => inject<CatalogStaticFilters | undefined>(catalogStaticFiltersKey, undefined)
