import type { CatalogReturn, CatalogConfig } from '../../../portal/app/composables/use-catalog'
import type { WritableComputedRef } from 'vue'

export function useCatalog<T, F extends Record<string, WritableComputedRef<string, string> | WritableComputedRef<string[], string[]> | WritableComputedRef<boolean, boolean>>> (
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
    sort: ref<string>(),
    order: ref<'-1' | '1'>(),
    goToPage: async () => { },
    loadMore: async () => { },
    filters: {} as F
  }
}
