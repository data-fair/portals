import type { AnalyticsInstance } from 'analytics'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _window = window as any

export const useAnalytics = () => _window.__ANALYTICS as AnalyticsInstance | undefined

export const useAnalyticsInfo = (portal: RequestPortal) => {
  const cookieTrack = useCookie<'yes' | 'no' | undefined>('df_portal_track', { maxAge: 60 * 60 * 24 * 365, sameSite: true, path: '/' })
  const cookieTrackOptOut = useCookie('df_portal_track_opt_out', { maxAge: 60 * 60 * 24 * 365, sameSite: true, path: '/' })
  // transition from old cookie
  if (('' + cookieTrack.value) === '1') cookieTrack.value = 'yes'
  else if (cookieTrackOptOut.value) cookieTrack.value = 'no'
  cookieTrackOptOut.value = undefined

  const trackerType = portal.config.analytics?.tracker.type ?? 'none'
  const requiresConsent = !portal.draft && trackerType !== 'none' && !portal.config.analytics?.tracker.anonymized
  if (!requiresConsent) cookieTrack.value = undefined

  return {
    cookieTrack,
    trackerType,
    requiresConsent
  }
}
