import { defineNuxtPlugin } from '#app'
import type { AnalyticsPlugin, AnalyticsInstance } from 'analytics'

export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$portal.draft) {
    console.log('ignore analytics configuration in draft mode')
    return
  }
  const portalConfig = nuxtApp.$portal.config

  let analytics: AnalyticsInstance | null = null
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
      const matomo = (await import('../utils/matomo')).default
      plugins.push(matomo({ ...portalConfig.analytics.tracker.params }))
    }

    const a = await import('analytics')
    analytics = a.Analytics({
      debug: true,
      plugins
    })

    nuxtApp.hook('page:loading:end', () => {
      console.log('PAGE')
      analytics?.page()
    })
  }
})
