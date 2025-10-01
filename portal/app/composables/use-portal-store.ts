import type { Portal } from '#api/types/portal'

type RequestPortal = Pick<Portal, '_id' | 'config' | 'owner' | 'staging'> & { draft: boolean }

export type PortalStore = ReturnType<typeof createPortalStore>
const portalStoreKey = Symbol('portal-store')

const createPortalStore = (portalData: RequestPortal) => {
  const portal = ref<RequestPortal>(portalData)
  const portalConfig = computed(() => portal.value.config)

  return { portal, portalConfig, preview: false }
}

export const providePortalStore = (portalData: RequestPortal) => {
  const store = createPortalStore(portalData)
  provide(portalStoreKey, store)
  return store
}

export const usePortalStore = () => {
  const store = inject(portalStoreKey) as PortalStore | undefined
  if (!store) throw new Error('Portal store was not initialized')
  return store
}
