// dynamic CSP modifications based on portal config
// similar to https://github.com/Baroshem/nuxt-security/blob/main/src/runtime/nitro/plugins/50-updateCsp.ts

import type { RequestPortal } from '../middleware/1.get-portal'

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const existingCsp = event.context.security.rules.headers.contentSecurityPolicy
    const portal: RequestPortal = event.context.portal
    const cspPatch: Record<string, string[]> = {}

    // add analytics target domains in connect-src

    if (portal.config.analytics?.tracker?.type === 'matomo') {
      const trackerBase = portal.config.analytics?.tracker?.params.trackerBase
      if (trackerBase) {
        if (trackerBase.startsWith('//')) {
          cspPatch['connect-src'] = [...existingCsp['connect-src'], 'http:' + trackerBase, 'https:' + trackerBase]
        } else {
          cspPatch['connect-src'] = [...existingCsp['connect-src'], trackerBase]
        }
      }
    }
    if (portal.config.analytics?.tracker?.type === 'google-analytics-v4') {
      // cf https://content-security-policy.com/examples/google-analytics/
      cspPatch['connect-src'] = [...existingCsp['connect-src'], 'www.google-analytics.com']
    }

    // TODO: allow frame-ancestors on restricted domains

    if (Object.keys(cspPatch).length) {
      event.context.security.rules.headers.contentSecurityPolicy = { ...existingCsp, ...cspPatch }
    }
  })
})
