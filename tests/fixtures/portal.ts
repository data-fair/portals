import { test as base, expect } from './login.ts'

export function portalUrl (portalId: string) {
  return `http://${portalId}.portals.${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
}

// the portal is served on its own subdomain: French and cache bypass on every subdomain too
export const test = base.extend<{
  goToPortal: (portalId: string, path?: string) => Promise<void>
}>({
  page: async ({ page }, use) => {
    await page.context().addCookies([
      { name: 'i18n_lang', value: 'fr', domain: `.${process.env.DEV_HOST}`, path: '/' },
      { name: 'cache_bypass', value: '1', domain: `.${process.env.DEV_HOST}`, path: '/' }
    ])
    await use(page)
  },

  goToPortal: async ({ page }, use) => {
    await use(async (portalId, path) => {
      await page.goto(portalUrl(portalId) + (path || '/'), { waitUntil: 'domcontentloaded' })
    })
  }
})

export { expect }
