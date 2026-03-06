import type { Portal, PortalConfig } from '#api/types/portal/index.ts'
import type { PageStore } from './use-page-store.ts'

type PreviewPortalItem = Pick<Portal, '_id' | 'title'>

export type PreviewPortalStore = ReturnType<typeof createPreviewPortalStore>
const previewPortalKey = Symbol('preview-portal')

const createPreviewPortalStore = (pageStore: PageStore) => {
  const previewPortalId = useStringSearchParam('portal')

  // fetch all portals for the selector (lightweight: just _id and title)
  const portalsFetch = useFetch<{ results: PreviewPortalItem[] }>(
    $apiPath + '/portals',
    { query: { select: '_id,title', size: 10000 } }
  )

  // set default portal when no URL param is set
  watch([() => pageStore.pageFetch.data.value, () => portalsFetch.data.value], () => {
    if (previewPortalId.value) return
    const page = pageStore.pageFetch.data.value
    const portals = portalsFetch.data.value?.results
    if (!page || !portals) return

    if (page.portals.length >= 1) {
      previewPortalId.value = page.portals[0]
    } else if (portals.length) {
      previewPortalId.value = portals[0]._id
    }
  }, { immediate: true })

  // fetch the selected portal's config
  const previewPortalUrl = computed(() => {
    if (!previewPortalId.value) return null
    return $apiPath + '/portals/' + previewPortalId.value
  })
  const previewPortalFetch = useFetch<Portal>(previewPortalUrl)

  const previewPortalConfig = computed<PortalConfig | undefined>(() => {
    return previewPortalFetch.data.value?.config
  })

  return {
    previewPortalId,
    previewPortalConfig,
    previewPortalFetch,
    portalsFetch,
    pageStore
  }
}

export const providePreviewPortal = (pageStore: PageStore) => {
  const store = createPreviewPortalStore(pageStore)
  provide(previewPortalKey, store)
  return store
}

export const usePreviewPortal = () => {
  const store = inject(previewPortalKey) as PreviewPortalStore | undefined
  if (!store) throw new Error('Preview portal store was not initialized')
  return store
}
