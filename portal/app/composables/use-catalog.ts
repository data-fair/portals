import type { WritableComputedRef } from 'vue'

type FetchResult<T> = { count: number; results: T[] }

type CatalogError = { statusCode?: number; message?: string }

export type FilterRef =
  | WritableComputedRef<string, string>
  | WritableComputedRef<string[], string[]>
  | WritableComputedRef<boolean, boolean>

export interface CatalogReturn<T, F> {
  displayedItems: Ref<T[]>
  itemsCount: ComputedRef<number>
  loading: Ref<boolean>
  currentPage: Ref<number>
  totalPages: ComputedRef<number>
  sort: Ref<string | undefined>
  order: Ref<'-1' | '1' | undefined>
  error: Ref<CatalogError | undefined>
  goToPage: (page: number) => Promise<void>
  loadMore: (paginationPosition?: string) => Promise<void>
  filters: F
}

export interface CatalogConfig<T, F extends Record<string, FilterRef>> {
  endpoint: string
  buildQuery: (filters: F, sortValue: string | undefined, page: number, pageSize: number) => Record<string, string | number>
  filterDefs: () => F
  defaultSortFallback: string
  analyticsCategory?: string
  /** Used by the UI workspace mock (ui/src/composables/use-catalog.ts) to
   *  render placeholder items in the page editor preview. Ignored at runtime
   *  by the portal implementation which fetches real data. */
  mockDataFactory?: () => T[]
}

export function useCatalog<T, F extends Record<string, FilterRef>> (
  element: { defaultSort?: string },
  config: CatalogConfig<T, F>
): CatalogReturn<T, F> {
  const pageSize = 20
  const defaultSort = element.defaultSort ?? config.defaultSortFallback
  const [defaultField, defaultOrder] = defaultSort.split(':') as [string, '-1' | '1']

  const filters = config.filterDefs()
  const sortFilter = useStringSearchParam('sort', { default: defaultSort })

  // Sort strategy:
  //   - Default sort is invisible: not shown in the UI (dropdown stays empty)
  //     and not in the URL (useStringSearchParam deletes the key when value
  //     equals its default).
  //   - On text search, consumers drop `sort` from the query entirely and the
  //     UI disables the sort control, so data-fair ranks by relevance. The
  //     chosen sort is kept in the URL and restored once the search is cleared.
  // Seed sort/order from the URL only when the active sort differs from the
  // default, so the dropdown reflects a user-chosen non-default value on load.
  const [initialField, initialOrder] = sortFilter.value !== defaultSort
    ? (sortFilter.value.split(':') as [string, '-1' | '1'])
    : [undefined, undefined]
  const sort = ref<string | undefined>(initialField)
  const order = ref<'-1' | '1' | undefined>(initialOrder)

  const currentPage = ref(1)
  const loading = ref(false)

  const query = computed(() => config.buildQuery(filters, sortFilter.value, currentPage.value, pageSize))

  const itemsFetch = useLocalFetch<FetchResult<T>>(config.endpoint, { query, watch: false })
  const itemsCount = computed(() => itemsFetch.data.value?.count || 0)
  const totalPages = computed(() => Math.ceil((itemsFetch.data.value?.count || 0) / pageSize))

  // Items accumulated across "load more" pages (infinite scroll); undefined when
  // not accumulating, so the displayed list comes straight from the latest
  // fetch. Reading itemsFetch.data through a computed (evaluated at render time,
  // once Nuxt has resolved the SSR data) is what puts the first page into the
  // server-rendered HTML and avoids the large layout shift on hydration.
  const appendedItems = ref<T[]>()
  const displayedItems = computed<T[]>(() => appendedItems.value ?? itemsFetch.data.value?.results ?? []) as Ref<T[]>

  const fetchPage = async () => {
    loading.value = true
    try {
      await itemsFetch.refresh()
    } finally {
      loading.value = false
    }
  }

  const goToPage = async (page: number) => {
    appendedItems.value = undefined
    currentPage.value = page
    await fetchPage()
  }

  const loadMore = async (paginationPosition: string = 'none') => {
    if (loading.value || paginationPosition !== 'none') return
    if (displayedItems.value.length >= (itemsFetch.data.value?.count || 0)) return
    // Freeze the items shown so far, then append the next page once it arrives.
    appendedItems.value = [...displayedItems.value]
    currentPage.value++
    await fetchPage()
    appendedItems.value = [...(appendedItems.value ?? []), ...(itemsFetch.data.value?.results ?? [])]
  }

  // When user changes sort/order in UI, update the URL-bound sortFilter
  watch([sort, order], () => {
    const field = sort.value || defaultField
    const ord = order.value || defaultOrder
    sortFilter.value = `${field}:${ord}`
  })

  // Watch all filters + sort to reset pagination and re-fetch
  const filterRefs = [...Object.values(filters), sortFilter]
  watch(filterRefs, async () => {
    appendedItems.value = undefined
    currentPage.value = 1
    await fetchPage()
    if (config.analyticsCategory && filters.search) {
      const searchRef = filters.search as WritableComputedRef<string, string>
      if (searchRef.value) {
        useAnalytics()?.track('search', {
          category: config.analyticsCategory,
          label: searchRef.value,
          resultsCount: itemsFetch.data.value?.count ?? 0
        })
      }
    }
  })

  return {
    displayedItems,
    itemsCount,
    loading,
    currentPage,
    totalPages,
    sort,
    order,
    error: itemsFetch.error,
    goToPage,
    loadMore,
    filters
  }
}
