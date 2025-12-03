import type { Reuse } from '#api/types/reuse'

// we do not use SSR, so we can use a simple module level singleton
export type ReuseStore = ReturnType<typeof createReuseStore>
const reuseStoreKey = Symbol('reuseStore')

const createReuseStore = (id: string) => {
  const reuseFetch = useFetch<Reuse>($apiPath + '/reuses/' + id)

  const reuse = ref<Reuse | null>()
  watch(reuseFetch.data, () => {
    reuse.value = reuseFetch.data.value
  })

  const patchReuse = useAsyncAction(async (patch: Partial<Reuse>) => {
    await $fetch(`/reuses/${id}`, { method: 'PATCH', body: patch })
    if (reuse.value) reuse.value = { ...reuse.value, ...patch }
  })

  return { reuseFetch, reuse, patchReuse }
}

export function provideReuseStore (reuseId: string) {
  const store = createReuseStore(reuseId)
  provide(reuseStoreKey, store)
  return store
}

export function useReuseStore () {
  const store = inject(reuseStoreKey) as ReuseStore | undefined
  if (!store) throw new Error('reuse store was not initialized')
  return store
}
