import { defineNuxtPlugin } from '#app'
import type { AnalyticsPlugin } from 'analytics'

export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$portal.draft) {
    console.log('ignore analytics configuration in draft mode')
    return
  }
  const portal = nuxtApp.$portal
  const { requiresConsent, trackerType, cookieTrack } = useAnalyticsInfo(portal)
  // Explicit opt-out or missing consent
  if (cookieTrack.value === 'no' || (requiresConsent && cookieTrack.value !== 'yes')) {
    console.log('analytics tracking disabled (opt-out or missing consent)')
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
    const analytics = window.__ANALYTICS = a.Analytics({ plugins })

    useRouter().afterEach((to, from) => {
      // from.name is absent on initial page load
      if (!from.name || from.path !== to.path) {
        // using path instead of title meta as it is what we did historically
        let pagePath = to.path
        if (portal.config.analytics?.mergeDatasetAppPaths) {
          const match = pagePath.match(/^\/(datasets|applications)\/[^/]+/)
          if (match) pagePath = match[0]
        }
        analytics?.page({ title: pagePath })
      }
    })
  }
})
