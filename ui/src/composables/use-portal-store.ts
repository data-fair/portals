import type { Portal, PortalConfig } from '#api/types/portal/index.ts'

type RequestPortal = Pick<Portal, '_id' | 'config' | 'owner' | 'staging'> & { draft: boolean }

// we do not use SSR, so we can use a simple module level singleton
export type PortalStore = ReturnType<typeof createPortalStore>
const portalStoreKey = Symbol('portal-store')

const createPortalStore = (config: PortalConfig) => {
  const session = useSessionAuthenticated()
  const portal = ref<RequestPortal>({
    _id: '',
    config,
    owner: session.account.value,
    staging: false,
    draft: true
  })
  const portalConfig = computed(() => portal.value.config)

  return { portal, portalConfig, preview: true }
}

export const providePortalStore = (config: PortalConfig) => {
  const store = createPortalStore(config)
  provide(portalStoreKey, store)
  return store
}

export const usePortalStore = () => {
  const store = inject(portalStoreKey) as PortalStore | undefined
  if (!store) throw new Error('Portal store was not initialized')
  return store
}
