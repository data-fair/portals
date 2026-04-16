import type { WritableComputedRef } from 'vue'

type FetchResult<T> = { count: number; results: T[] }

export interface CatalogReturn<T, F> {
  displayedItems: Ref<T[]>
  itemsCount: ComputedRef<number>
  loading: Ref<boolean>
  currentPage: Ref<number>
  totalPages: ComputedRef<number>
  sort: WritableComputedRef<string | undefined>
  order: WritableComputedRef<'-1' | '1' | undefined>
  goToPage: (page: number) => Promise<void>
  loadMore: (paginationPosition?: string) => Promise<void>
  filters: F
}

export interface CatalogConfig<T, F extends Record<string, WritableComputedRef<string, string> | WritableComputedRef<string[], string[]> | WritableComputedRef<boolean, boolean>>> {
  endpoint: string
  useLocalFetch?: boolean
  buildQuery: (filters: F, sortValue: string | undefined, page: number, pageSize: number) => Record<string, string | number>
  filterDefs: () => F
  defaultSortFallback: string
  analyticsCategory?: string
  mockDataFactory?: () => T[]
}

export function useCatalog<T, F extends Record<string, WritableComputedRef<string, string> | WritableComputedRef<string[], string[]> | WritableComputedRef<boolean, boolean>>> (
  element: { defaultSort?: string },
  config: CatalogConfig<T, F>
): CatalogReturn<T, F> {
  const pageSize = 20
  const defaultSort = element.defaultSort ?? config.defaultSortFallback
  const defaultSortParts = defaultSort.split(':')
  const defaultField = defaultSortParts[0]
  const defaultOrder = defaultSortParts[1] as '-1' | '1'

  const filters = config.filterDefs()
  const sortFilter = useStringSearchParam('sort', { default: defaultSort })

  // sort and order are derived from sortFilter (URL source of truth)
  const sort = computed({
    get: () => {
      const val = sortFilter.value
      if (!val) return undefined
      const idx = val.lastIndexOf(':')
      return idx > 0 ? val.substring(0, idx) : undefined
    },
    set: (v: string | undefined) => {
      const ord = order.value ?? defaultOrder
      sortFilter.value = v ? `${v}:${ord}` : defaultSort
    }
  })

  const order = computed({
    get: () => {
      const val = sortFilter.value
      if (!val) return undefined
      const idx = val.lastIndexOf(':')
      if (idx > 0) {
        const o = val.substring(idx + 1)
        return (o === '1' || o === '-1') ? o as '-1' | '1' : undefined
      }
      return undefined
    },
    set: (v: '-1' | '1' | undefined) => {
      const field = sort.value ?? defaultField
      sortFilter.value = `${field}:${v ?? defaultOrder}`
    }
  })

  const currentPage = ref(1)
  const displayedItems = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)

  const query = computed(() => config.buildQuery(filters, sortFilter.value, currentPage.value, pageSize))

  const fetchFn = config.useLocalFetch ? useLocalFetch : useFetch
  const itemsFetch = fetchFn<FetchResult<T>>(config.endpoint, { query, watch: false })
  const itemsCount = computed(() => itemsFetch.data.value?.count || 0)
  const totalPages = computed(() => Math.ceil((itemsFetch.data.value?.count || 0) / pageSize))

  // Initialize displayedItems with SSR data (available via Nuxt payload)
  if (itemsFetch.data.value?.results) {
    displayedItems.value = [...itemsFetch.data.value.results]
  }

  const goToPage = async (page: number) => {
    loading.value = true
    try {
      currentPage.value = page
      await itemsFetch.refresh()
      if (itemsFetch.data.value?.results) {
        displayedItems.value = [...itemsFetch.data.value.results]
      }
    } finally {
      loading.value = false
    }
  }

  const loadMore = async (paginationPosition: string = 'none') => {
    if (loading.value || paginationPosition !== 'none') return
    if (displayedItems.value.length >= (itemsFetch.data.value?.count || 0)) return
    loading.value = true
    try {
      currentPage.value++
      await itemsFetch.refresh()
      if (itemsFetch.data.value?.results) {
        displayedItems.value.push(...itemsFetch.data.value.results)
      }
    } finally {
      loading.value = false
    }
  }

  // Watch all filters + sort to reset pagination and re-fetch
  const filterRefs = [...Object.values(filters), sortFilter]
  watch(filterRefs, async () => {
    currentPage.value = 1
    loading.value = true
    try {
      await itemsFetch.refresh()
      if (itemsFetch.data.value?.results) {
        displayedItems.value = [...itemsFetch.data.value.results]
      }
    } finally {
      loading.value = false
    }
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
    goToPage,
    loadMore,
    filters
  }
}
