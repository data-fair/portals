import type { UseFetchOptions } from 'nuxt/app'

export function useLocalFetch<T> (
  url: string | Request | Ref<string | Request> | (() => string | Request),
  options: UseFetchOptions<T> = {}
) {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$localFetch,
  })
}
