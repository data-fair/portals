// cf https://github.com/koumoul-dev/vue-multianalytics/blob/master/src/modules/MatomoModule.js
// https://github.com/DavidWells/analytics?tab=readme-ov-file#creating-analytics-plugins

import type { AnalyticsPlugin } from 'analytics'
import debugModule from 'debug'
// @ts-expect-error - Force import of browser version instead of browserless
import { pianoAnalytics } from 'piano-analytics-js/dist/browser/piano-analytics.esm.js'

const debug = debugModule('piano')

type PianoPluginConfig = { site?: number, collectDomain?: string, anonymized?: boolean }

export default function pianoPlugin (params: PianoPluginConfig): AnalyticsPlugin {
  const plugin: AnalyticsPlugin = {
    name: 'piano',
    initialize: ({ config }) => {
      if (!params.site) throw new Error('Analytics : Please provide site option to Piano module')
      if (!params.collectDomain) throw new Error('Analytics : Please provide collectDomain option to Piano module')
      const privacyDefaultMode = params.anonymized ? 'exempt' : 'optin'
      pianoAnalytics.setConfigurations({ ...params, privacyDefaultMode })
    },
    page: ({ payload }) => {
      debug('page', payload.properties)
      pianoAnalytics.sendEvent('page.display', { page: payload.properties.title })
    },
    track: ({ payload }) => {
      debug('track', payload)
      pianoAnalytics.sendEvent('page.display', { page: payload.properties.title })
      if (payload.event === 'search') {
        pianoAnalytics.sendEvent('internal_search_result.display', { ise_keyword: payload.properties.label })
      } else if (payload.event.startsWith('download')) {
        pianoAnalytics.sendEvent('click.download', { click: payload.event, click_chapter1: payload.properties.label })
      } else {
        pianoAnalytics.sendEvent('click.action', { click: payload.event, click_chapter1: payload.properties.label })
      }
    }
  }

  return plugin
}
