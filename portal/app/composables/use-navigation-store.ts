import type { VBreadcrumbs } from 'vuetify/components'

type BreadcrumbItems = NonNullable<VBreadcrumbs['$props']['items']>

export type NavigationStore = ReturnType<typeof createNavigationStore>
const navigationStoreKey = Symbol('navigation-store')

const createNavigationStore = () => {
  const _breadcrumbs = ref<BreadcrumbItems>([])
  const _breadcrumbsRouteName = ref<string | null>(null)

  const setBreadcrumbs = (breadcrumbItems: BreadcrumbItems, routeName?: string) => {
    _breadcrumbs.value = breadcrumbItems
    _breadcrumbsRouteName.value = routeName || null
  }

  const clearBreadcrumbs = () => {
    _breadcrumbs.value = []
    _breadcrumbsRouteName.value = null
  }

  const showBreadcrumbs = computed(() => {
    const { name } = useRoute()
    return _breadcrumbs.value.length > 0 && _breadcrumbsRouteName.value === name
  })

  return {
    breadcrumbs: _breadcrumbs,
    showBreadcrumbs,
    setBreadcrumbs,
    clearBreadcrumbs
  }
}

export const provideNavigationStore = () => {
  const store = createNavigationStore()
  provide(navigationStoreKey, store)
  return store
}

export const useNavigationStore = () => {
  const store = inject(navigationStoreKey) as NavigationStore | undefined
  if (!store) throw new Error('breadcrumbs store was not initialized')
  return store
}
