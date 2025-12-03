import type { Reuse } from '#api/types/reuse'

const reuseStoreKey = Symbol('reuseStore') as InjectionKey<ReturnType<typeof useReuseStoreInternal>>

function useReuseStoreInternal (reuseId: string) {
  const fetchResult = useFetch<Reuse>($apiPath + '/reuses/' + reuseId)

  const patchReuse = useAsyncAction(async (data: Partial<Reuse>) => {
    await $fetch($apiPath + '/reuses/' + reuseId, {
      method: 'PATCH',
      body: data
    })
    await fetchResult.refresh()
  })

  return { reuseFetch: fetchResult, patchReuse }
}

export function provideReuseStore (reuseId: string) {
  const store = useReuseStoreInternal(reuseId)
  provide(reuseStoreKey, store)
  return store
}

export function useReuseStore () {
  const store = inject(reuseStoreKey)
  if (!store) {
    throw new Error('useReuseStore() is called without provideReuseStore() in parent')
  }
  return store
}
