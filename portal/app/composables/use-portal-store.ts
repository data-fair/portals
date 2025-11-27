import type { Portal } from '#api/types/portal'
import type { SiteInfo } from '@data-fair/lib-vue/session'

export type RequestPortal = Pick<Portal, '_id' | 'config' | 'owner' | 'staging'> & { draft: boolean }

export type PortalStore = ReturnType<typeof createPortalStore>
const portalStoreKey = Symbol('portal-store')

const createPortalStore = (portalData: RequestPortal, siteInfo: SiteInfo) => {
  const portal = ref<RequestPortal>(portalData)
  const portalConfig = computed(() => portal.value.config)

  return { portal, portalConfig, preview: false, siteInfo }
}

export const providePortalStore = (portalData: RequestPortal, siteInfo: SiteInfo) => {
  const store = createPortalStore(portalData, siteInfo)
  provide(portalStoreKey, store)
  return store
}

export const usePortalStore = () => {
  const store = inject(portalStoreKey) as PortalStore | undefined
  if (!store) throw new Error('Portal store was not initialized')
  return store
}
