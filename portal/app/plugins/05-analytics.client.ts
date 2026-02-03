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
  const portal = nuxtApp.$portal
  const { requiresConsent, trackerType, cookieTrack } = useAnalyticsInfo(portal)
  if (requiresConsent && cookieTrack.value !== 'yes') {
    console.log('analytics tracking requires consent that was not yet granted')
    return
  }

  if (portal.config.analytics && trackerType !== 'none') {
    const plugins: AnalyticsPlugin[] = []
    if (portal.config.analytics.tracker.type === 'google-analytics-v4') {
      // https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-google-analytics
      // @ts-expect-error plugin not typed
      const ga = (await import('@analytics/google-analytics')).default
      plugins.push(ga({ ...portal.config.analytics.tracker.params }))
    }

    if (portal.config.analytics.tracker.type === 'matomo') {
      const matomo = (await import('../utils/analytics/matomo')).default
      plugins.push(matomo({ ...portal.config.analytics.tracker.params }))
    }

    if (portal.config.analytics.tracker.type === 'piano') {
      const piano = (await import('../utils/analytics/piano')).default
      plugins.push(piano({
        ...portal.config.analytics.tracker.params,
        anonymized: portal.config.analytics.tracker.anonymized
      }))
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
