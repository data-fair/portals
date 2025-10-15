import type { UseFetchOptions, AsyncData } from 'nuxt/app'

export function useLocalFetch<T = unknown> (
  _url: string | (() => string),
  _options: UseFetchOptions<T> = {}
): AsyncData<T, Error> {
  throw new Error('useLocalFetch should only be called from portal, not portals-manager')
}

export function useRuntimeConfig (): any {
  throw new Error('useRuntimeConfig should only be called from portal, not portals-manager')
}

export function useRequestURL (): any {
  throw new Error('useRequestURL should only be called from portal, not portals-manager')
}
