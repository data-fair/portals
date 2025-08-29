import type { Page } from '#api/types/page/index'

// we do not use SSR, so we can use a simple module level singleton
export type PageStore = ReturnType<typeof createPageStore>
const pageStoreKey = Symbol('page-store')

const createPageStore = (id: string) => {
  const pageFetch = useFetch<Page>($apiPath + '/pages/' + id)

  const page = ref<Page | null>()
  watch(pageFetch.data, () => {
    page.value = pageFetch.data.value
  })

  const patchPage = useAsyncAction(async (patch: Partial<Page>) => {
    await $fetch(`/pages/${id}`, { method: 'PATCH', body: patch })
    if (page.value) page.value = { ...page.value, ...patch }
  })

  return { pageFetch, page, patchPage }
}

export const providePageStore = (id: string) => {
  const store = createPageStore(id)
  provide(pageStoreKey, store)
  return store
}

export const usePageStore = () => {
  const store = inject(pageStoreKey) as PageStore | undefined
  if (!store) throw new Error('page store was not initialized')
  return store
}
