// cf https://github.com/koumoul-dev/vue-multianalytics/blob/master/src/modules/MatomoModule.js
// https://github.com/DavidWells/analytics?tab=readme-ov-file#creating-analytics-plugins

import type { AnalyticsPlugin } from 'analytics'
import debugModule from 'debug'

const debug = debugModule('matomo')

type MatomoPluginConfig = { trackerBase?: string, siteId?: string, nonce?: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _window = window as any

export default function matomoPlugin (params: MatomoPluginConfig): AnalyticsPlugin {
  const plugin: AnalyticsPlugin = {
    name: 'matomo',
    initialize: ({ config }) => {
      if (!params.siteId) throw new Error('Analytics : Please provide siteId option to Matomo module')
      if (!params.trackerBase) throw new Error('Analytics : Please provide trackerBase option to Matomo module')

      // The matomo configuration array, cf https://developer.matomo.org/guides/tracking-javascript-guide
      // items are of the form ['API_method_name', parameters...]
      _window._paq = _window._paq || []
      const trackerUrl = params.trackerBase + (params.trackerBase.endsWith('/') ? 'piwik.php' : '/piwik.php')
      _window._paq.push(['setTrackerUrl', trackerUrl])
      _window._paq.push(['setSiteId', params.siteId])
      const d = document
      const g = d.createElement('script')
      const s = d.getElementsByTagName('script')[0]
      g.type = 'text/javascript'
      g.async = true
      g.defer = true
      g.src = trackerUrl
      if (params.nonce) g.nonce = params.nonce
      s!.parentNode!.insertBefore(g, s!)
    },
    page: ({ payload }) => {
      debug('page', payload.properties)
      _window._paq.push(['setDocumentTitle', payload.properties.title])
      _window._paq.push(['trackPageView'])
    },
    track: ({ payload }) => {
      debug('track', payload)
      _window._paq.push(['trackEvent', payload.properties.category, payload.event, payload.properties.label])
    }
  }

  return plugin
}
