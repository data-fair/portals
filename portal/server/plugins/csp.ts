// dynamic CSP modifications based on portal config
// similar to https://github.com/Baroshem/nuxt-security/blob/main/src/runtime/nitro/plugins/50-updateCsp.ts
import type { RequestPortal } from '~~/server/middleware/1.get-portal'

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const headers = event.context.security?.rules?.headers
    if (!headers || !headers.contentSecurityPolicy) return

    const existingCsp: Record<string, string[]> = headers.contentSecurityPolicy as Record<string, string[]>
    const portal: RequestPortal = event.context.portal
    const cspPatch: Record<string, string[]> = {}

    // Add analytics target domains in connect-src
    const analyticsTracker = portal.config.analytics?.tracker
    if (analyticsTracker?.type === 'matomo') {
      const trackerBase = analyticsTracker.params.trackerBase
      if (trackerBase) {
        if (trackerBase.startsWith('//')) {
          cspPatch['connect-src'] = [...(existingCsp['connect-src'] ?? []), 'http:' + trackerBase, 'https:' + trackerBase]
        } else {
          cspPatch['connect-src'] = [...(existingCsp['connect-src'] ?? []), trackerBase]
        }
      }
    }
    if (analyticsTracker?.type === 'google-analytics-v4') {
      // cf https://content-security-policy.com/examples/google-analytics/
      cspPatch['connect-src'] = [...(existingCsp['connect-src'] ?? []), 'www.google-analytics.com']
    }
    if (analyticsTracker?.type === 'piano') {
      const collectDomain = analyticsTracker?.params.collectDomain
      if (collectDomain) cspPatch['connect-src'] = [...(existingCsp['connect-src'] ?? []), collectDomain]
    }

    // Allow frame-ancestors on restricted domains
    const globalFrameAncestors = config.frameAncestors.split(',').filter(Boolean)
    if (globalFrameAncestors.length || (portal.config.allowedFrameAncestors && portal.config.allowedFrameAncestors.length)) {
      cspPatch['frame-ancestors'] = [
        ...(existingCsp['frame-ancestors'] ?? []),
        ...globalFrameAncestors,
        ...(portal.config.allowedFrameAncestors ?? [])
      ]
    }

    // Allow frame-src for embedded iframes in the portal
    if (portal.config.allowedFrameSources && portal.config.allowedFrameSources.length > 0) {
      cspPatch['frame-src'] = [...(existingCsp['frame-src'] ?? []), ...portal.config.allowedFrameSources]
    }

    if (Object.keys(cspPatch).length) headers.contentSecurityPolicy = { ...existingCsp, ...cspPatch }
  })
})
