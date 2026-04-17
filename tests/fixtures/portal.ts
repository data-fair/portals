import { test as base, expect } from '@playwright/test'

export function portalUrl (portalId: string) {
  return `http://${portalId}.portals.${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
}

export const test = base.extend<{
  goToPortal: (portalId: string, path?: string) => Promise<void>
}>({
      page: async ({ page }, use) => {
        await page.context().addCookies([{
          name: 'i18n_lang',
          value: 'fr',
          domain: `.${process.env.DEV_HOST}`,
          path: '/'
        }, {
          name: 'cache_bypass',
          value: '1',
          domain: `.${process.env.DEV_HOST}`,
          path: '/'
        }])
        await use(page)
      },

      goToPortal: async ({ page }, use) => {
        const goToPortal = async (portalId: string, path?: string) => {
          const url = portalUrl(portalId) + (path || '/')
          await page.goto(url)
        }
        await use(goToPortal)
      }
    })

export { expect }
