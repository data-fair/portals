import type { CatalogReturn } from '../../../portal/app/composables/use-catalog'

export function useCatalog<T, F> (
  _element: { defaultSort?: string },
  config: { mockDataFactory?: () => T[] }
): CatalogReturn<T, F> {
  const displayedItems = ref(config.mockDataFactory?.() ?? []) as Ref<T[]>

  return {
    displayedItems,
    itemsCount: computed(() => displayedItems.value.length),
    loading: ref(false),
    currentPage: ref(1),
    totalPages: computed(() => 1),
    sort: ref<string>(),
    order: ref<'-1' | '1'>(),
    goToPage: async () => { },
    loadMore: async () => { },
    filters: {} as F
  }
}
