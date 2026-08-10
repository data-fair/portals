// cf https://github.com/koumoul-dev/vue-multianalytics/blob/master/src/modules/MatomoModule.js
// https://github.com/DavidWells/analytics?tab=readme-ov-file#creating-analytics-plugins

import type { AnalyticsPlugin } from 'analytics'
import debugModule from 'debug'

const debug = debugModule('matomo')

// The queue is created by matomo's own snippet or by initialize below, whichever
// comes first, so every call site has to tolerate it not being there yet.
const paq = () => (window._paq ??= [])

type MatomoPluginConfig = { trackerBase?: string, siteId?: string, nonce?: string }

export default function matomoPlugin (params: MatomoPluginConfig): AnalyticsPlugin {
  const plugin: AnalyticsPlugin = {
    name: 'matomo',
    initialize: ({ config }) => {
      if (!params.siteId) throw new Error('Analytics : Please provide siteId option to Matomo module')
      if (!params.trackerBase) throw new Error('Analytics : Please provide trackerBase option to Matomo module')

      // The matomo configuration array, cf https://developer.matomo.org/guides/tracking-javascript-guide
      // items are of the form ['API_method_name', parameters...]
      paq()
      const trackerBase = params.trackerBase + (params.trackerBase.endsWith('/') ? '' : '/')
      paq().push(['setTrackerUrl', trackerBase + 'piwik.php'])
      paq().push(['setSiteId', params.siteId])
      const d = document
      const g = d.createElement('script')
      const s = d.getElementsByTagName('script')[0]
      g.type = 'text/javascript'
      g.async = true
      g.defer = true
      g.src = trackerBase + 'piwik.js'
      if (params.nonce) g.nonce = params.nonce
      s!.parentNode!.insertBefore(g, s!)
    },
    page: ({ payload }) => {
      debug('page', payload.properties)
      paq().push(['setDocumentTitle', payload.properties.title])
      paq().push(['trackPageView'])
    },
    track: ({ payload }) => {
      debug('track', payload)
      if (payload.event === 'search') {
        // https://developer.matomo.org/guides/tracking-javascript-guide#internal-search-tracking
        paq().push(['trackSiteSearch', payload.properties.label, payload.properties.category, payload.properties.resultsCount])
      } else if (payload.event.startsWith('download')) {
        const url = payload.properties.url || `${window.location.origin}/download/${payload.properties.label}`
        paq().push(['trackLink', url, 'download'])
      } else {
        paq().push(['trackEvent', payload.properties.category, payload.event, payload.properties.label])
      }
    }
  }

  return plugin
}
