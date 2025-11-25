import type { AnalyticsInstance } from 'analytics'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _window = window as any

export const useAnalytics = () => _window.__ANALYTICS as AnalyticsInstance | undefined
