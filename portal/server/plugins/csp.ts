// dynamic CSP modifications based on portal config
// similar to https://github.com/Baroshem/nuxt-security/blob/main/src/runtime/nitro/plugins/50-updateCsp.ts

import type { RequestPortal } from '../middleware/1.get-portal'

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  const globalFrameAncestors = config.frameAncestors.split(',').filter(Boolean)
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const existingCsp: Record<string, string[]> = event.context.security.rules.headers.contentSecurityPolicy
    const portal: RequestPortal = event.context.portal
    const cspPatch: Record<string, string[]> = {}

    // Add analytics target domains in connect-src
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
    if (portal.config.analytics?.tracker?.type === 'piano') {
      const collectDomain = portal.config.analytics?.tracker?.params.collectDomain
      if (collectDomain) cspPatch['connect-src'] = [...existingCsp['connect-src'], collectDomain]
    }

    // allow frame-ancestors on restricted domains
    if (globalFrameAncestors.length || (portal.config.allowedFrameAncestors && portal.config.allowedFrameAncestors.length > 0)) {
      cspPatch['frame-ancestors'] = [
        ...existingCsp['frame-ancestors'],
        ...globalFrameAncestors,
        ...(portal.config.allowedFrameAncestors ?? [])
      ]
    }

    // allow frame-src for embedded iframes in the portal
    if (portal.config.allowedFrameSources && portal.config.allowedFrameSources.length > 0) {
      cspPatch['frame-src'] = [...existingCsp['frame-src'], ...portal.config.allowedFrameSources]
    }

    if (Object.keys(cspPatch).length) {
      event.context.security.rules.headers.contentSecurityPolicy = { ...existingCsp, ...cspPatch }
    }
  })
})
