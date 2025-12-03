import type { Use } from '#api/types/use'

const useStoreKey = Symbol('useStore') as InjectionKey<ReturnType<typeof useUseStoreInternal>>

function useUseStoreInternal (useId: string) {
  const fetchResult = useFetch<Use>($apiPath + '/uses/' + useId)

  const patchUse = useAsyncAction(async (data: Partial<Use>) => {
    await $fetch($apiPath + '/uses/' + useId, {
      method: 'PATCH',
      body: data
    })
    await fetchResult.refresh()
  })

  return { useFetch: fetchResult, patchUse }
}

export function provideUseStore (useId: string) {
  const store = useUseStoreInternal(useId)
  provide(useStoreKey, store)
  return store
}

export function useUseStore () {
  const store = inject(useStoreKey)
  if (!store) {
    throw new Error('useUseStore() is called without provideUseStore() in parent')
  }
  return store
}
