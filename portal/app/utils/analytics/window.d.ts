import type { AnalyticsInstance } from 'analytics'

// The two globals the analytics stack hangs off window: the shared analytics
// instance, and the matomo command queue whose entries are ['method', ...args].
declare global {
  interface Window {
    __ANALYTICS?: AnalyticsInstance
    _paq?: unknown[][]
  }
}

export {}
