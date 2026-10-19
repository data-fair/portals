import { test as base, expect } from './login.ts'

export function portalUrl (portalId: string) {
  return `http://${portalId}.portals.${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
}

// the portal is served on its own subdomain: French and cache bypass on every subdomain too
export const test = base.extend<{
  goToPortal: (portalId: string, path?: string) => Promise<void>
}>({
  page: async ({ page, browserName }, use) => {
    await page.context().addCookies([
      { name: 'i18n_lang', value: 'fr', domain: `.${process.env.DEV_HOST}`, path: '/' },
      { name: 'cache_bypass', value: '1', domain: `.${process.env.DEV_HOST}`, path: '/' }
    ])
    // WebKit applies the CSP upgrade-insecure-requests to http://*.localhost (Chromium and Firefox
    // do not): every portal resource then fails TLS. The dev env is http, production keeps the directive.
    if (browserName === 'webkit') {
      await page.route('**/*', async (route) => {
        if (route.request().resourceType() !== 'document') return route.fallback()
        const response = await route.fetch()
        const headers = response.headers()
        const csp = headers['content-security-policy']
        if (csp) headers['content-security-policy'] = csp.replace(/upgrade-insecure-requests;?\s*/, '')
        await route.fulfill({ response, headers })
      })
    }
    await use(page)
  },

  goToPortal: async ({ page }, use) => {
    await use(async (portalId, path) => {
      await page.goto(portalUrl(portalId) + (path || '/'), { waitUntil: 'domcontentloaded' })
    })
  }
})

export { expect }
