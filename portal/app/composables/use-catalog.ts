import type { WritableComputedRef } from 'vue'

type FetchResult<T> = { count: number; results: T[] }

export interface CatalogReturn<T, F> {
  displayedItems: Ref<T[]>
  itemsCount: ComputedRef<number>
  loading: Ref<boolean>
  currentPage: Ref<number>
  totalPages: ComputedRef<number>
  sort: Ref<string | undefined>
  order: Ref<'-1' | '1' | undefined>
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

  const filters = config.filterDefs()
  const sortFilter = useStringSearchParam('sort', { default: element.defaultSort })

  const sort = ref<string>()
  const order = ref<'-1' | '1'>()

  const currentPage = ref(1)
  const displayedItems = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)

  const query = computed(() => config.buildQuery(filters, sortFilter.value, currentPage.value, pageSize))

  const itemsFetch = useFetch<FetchResult<T>>(config.endpoint, { query, watch: false })
  const itemsCount = computed(() => itemsFetch.data.value?.count || 0)
  const totalPages = computed(() => Math.ceil((itemsFetch.data.value?.count || 0) / pageSize))

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

  onMounted(async () => {
    await itemsFetch.refresh()
    if (itemsFetch.data.value?.results) {
      displayedItems.value = [...itemsFetch.data.value.results]
    }
  })

  // Watch all filters + sort to reset pagination
  const filterRefs = [...Object.values(filters), sortFilter]
  watch(filterRefs, async () => {
    currentPage.value = 1
    await itemsFetch.refresh()
    if (itemsFetch.data.value?.results) {
      displayedItems.value = [...itemsFetch.data.value.results]
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

  // Update sort param when sort/order change
  watch([sort, order], () => {
    const [defaultField, defaultOrder] = element.defaultSort?.split(':') || config.defaultSortFallback.split(':')
    const field = sort.value || defaultField
    const ord = order.value || defaultOrder
    sortFilter.value = `${field}:${ord}`
  }, { immediate: true })

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
