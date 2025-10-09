export type NavigationStore = ReturnType<typeof createNavigationStore>
const navigationStoreKey = Symbol('navigation-store')

const createNavigationStore = () => {
  const drawer = ref(false) // Simple boolean shared between navigations components

  const setBreadcrumbs = () => {}

  const clearBreadcrumbs = () => {}

  const showBreadcrumbs = computed(() => {})

  /** Check if a menu item (or any of its children) matches the current route */
  const isMenuItemActive = (): boolean => { return false }

  /** Resolve a link or menu item to its corresponding URL path */
  const resolveLink = () => { return undefined }

  return {
    breadcrumbs: ref([]),
    showBreadcrumbs,
    setBreadcrumbs,
    clearBreadcrumbs,
    isMenuItemActive,
    resolveLink,
    drawer
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
