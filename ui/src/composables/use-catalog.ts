import type { CatalogReturn, CatalogConfig, FilterRef } from '#portal/app/composables/use-catalog'

export function useCatalog<T, F extends Record<string, FilterRef>> (
  _element: { defaultSort?: string },
  config: CatalogConfig<T, F>
): CatalogReturn<T, F> {
  const displayedItems = ref(config.mockDataFactory?.() ?? []) as Ref<T[]>

  return {
    displayedItems,
    itemsCount: computed(() => displayedItems.value.length),
    loading: ref(false),
    currentPage: ref(1),
    totalPages: computed(() => 1),
    sort: computed({ get: () => undefined as string | undefined, set: () => {} }),
    order: computed({ get: () => undefined as '-1' | '1' | undefined, set: () => {} }),
    goToPage: async () => { },
    loadMore: async () => { },
    filters: {} as F
  }
}
