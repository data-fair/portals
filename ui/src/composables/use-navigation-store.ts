const drawer = ref(false)
const setBreadcrumbs = () => {}
const clearBreadcrumbs = () => {}
const showBreadcrumbs = computed(() => {
  console.warn('showBreadcrumbs is used in portals-manager')
  return true
})

const isMenuItemActive = (_item: any, _currentPath: string): boolean => { return false }
const resolveLink = (_link: any | any) => { return undefined }

export const useNavigationStore = () => {
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
