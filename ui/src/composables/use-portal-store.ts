import type { Portal, PortalConfig } from '#api/types/portal/index.ts'

type RequestPortal = Pick<Portal, '_id' | 'config' | 'owner' | 'whiteLabel' | 'staging'> & { draft: boolean }

// we do not use SSR, so we can use a simple module level singleton
export type PortalStore = ReturnType<typeof createPortalStore>
const portalStoreKey = Symbol('portal-store')

const createPortalStore = (config?: PortalConfig) => {
  const session = useSessionAuthenticated()
  const portal = ref<RequestPortal>({
    _id: '',
    config: config || {} as PortalConfig,
    owner: session.account.value,
    staging: false,
    draft: true
  })
  const portalConfig = computed({
    get: () => portal.value.config,
    set: (newConfig: PortalConfig) => { portal.value.config = newConfig }
  })

  return { portal, portalConfig, preview: true, siteInfo: session.site.value! }
}

export const providePortalStore = (config?: PortalConfig) => {
  const store = createPortalStore(config)
  provide(portalStoreKey, store)
  return store
}

export const usePortalStore = () => {
  const store = inject(portalStoreKey) as PortalStore | undefined
  if (!store) throw new Error('Portal store was not initialized')
  return store
}
