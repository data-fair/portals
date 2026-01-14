import type { UseFetchOptions, AsyncData } from 'nuxt/app'

export function useLocalFetch<T = unknown> (
  _url: string | (() => string) | Ref<string>,
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

export function useCookie (_name: string, _options?: any): any {
  throw new Error('useCookie should only be called from portal, not portals-manager')
}

export function useAnalytics (): any {
  throw new Error('useAnalytics should only be called from portal, not portals-manager')
}

export function useAnalyticsInfo (_portal: any): any {
  throw new Error('useAnalytics should only be called from portal, not portals-manager')
}

export function useRequestEvent (): any {
  throw new Error('useRequestEvent should only be called from portal, not portals-manager')
}

export function setResponseStatus (_event: any, _statusCode: number): void {
  throw new Error('setResponseStatus should only be called from portal, not portals-manager')
}
