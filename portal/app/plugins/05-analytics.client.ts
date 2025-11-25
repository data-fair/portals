import { defineNuxtPlugin } from '#app'
import type { AnalyticsPlugin } from 'analytics'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _window = window as any

export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$portal.draft) {
    console.log('ignore analytics configuration in draft mode')
    return
  }
  const portalConfig = nuxtApp.$portal.config
  const cookiePortalTrack = useCookie<string>('df_portal_track')
  if (cookiePortalTrack.value === 'yes' || ((cookiePortalTrack.value + '') === '1')) {
    // console.log('tracking was enabled by df_portal_track cookie')
  } else {
    // console.log('tracking was not enabled by df_portal_track cookie')
    return
  }

  const trackerType = portalConfig.analytics?.tracker.type
  if (portalConfig.analytics && trackerType && trackerType !== 'none') {
    const plugins: AnalyticsPlugin[] = []
    if (portalConfig.analytics.tracker.type === 'google-analytics-v4') {
      // https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-google-analytics
      // @ts-expect-error plugin not typed
      const ga = (await import('@analytics/google-analytics')).default
      plugins.push(ga({ ...portalConfig.analytics.tracker.params }))
    }

    if (portalConfig.analytics.tracker.type === 'matomo') {
      const matomo = (await import('../utils/analytics/matomo')).default
      plugins.push(matomo({ ...portalConfig.analytics.tracker.params }))
    }

    if (portalConfig.analytics.tracker.type === 'piano') {
      const piano = (await import('../utils/analytics/piano')).default
      plugins.push(piano({ ...portalConfig.analytics.tracker.params }))
    }

    const a = await import('analytics')
    const analytics = _window.__ANALYTICS = a.Analytics({ plugins })

    useRouter().afterEach((to, from) => {
      // from.name is absent on initial page load
      if (!from.name || from.path !== to.path) {
        // using path instead of title meta as it is what we did historically
        analytics?.page({ title: to.path })
      }
    })
  }
})
