import { test as base, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

const cookieCache = new Map<string, Awaited<ReturnType<import('@playwright/test').BrowserContext['cookies']>>>()

async function performLogin (page: any, context: any, baseUrl: string, portalUrl: string, user: string) {
  const password = user === 'test_superadmin' ? 'superpasswd' : 'passwd'
  const loginUrl = `${baseUrl}/simple-directory/login?redirect=${encodeURIComponent(portalUrl)}`
  await page.goto(loginUrl)
  await page.getByLabel('Adresse mail').fill(`${user}@test.com`)
  await page.getByLabel('Mot de passe').fill(password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL(portalUrl, { timeout: 15000 })
  const cookies = await context.cookies()
  cookieCache.set(user, cookies)
}

const test = base.extend<{
  goToPortalWithAuth: (portalId: string, path: string, user: string) => Promise<void>
}>({
      goToPortalWithAuth: async ({ page, context }, use) => {
        const baseUrl = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
        const goToPortalWithAuth = async (portalId: string, path: string, user: string) => {
          const portalUrl = `http://${portalId}.portals.${process.env.DEV_HOST}:${process.env.NGINX_PORT}${path}`
          const cached = cookieCache.get(user)
          if (cached) {
            await context.addCookies(cached)
            await page.goto(portalUrl, { timeout: 15000 })
            if (page.url().includes('/simple-directory/login')) {
              cookieCache.delete(user)
              await performLogin(page, context, baseUrl, portalUrl, user)
            }
          } else {
            await performLogin(page, context, baseUrl, portalUrl, user)
          }
        }
        await use(goToPortalWithAuth)
      }
    })

test.describe('edit resource button', () => {
  test.beforeEach(clean)

  test('hidden for anonymous on news page', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Edit Btn Anon Portal', menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'news',
      config: {
        title: 'Anon News',
        newsMetadata: { slug: 'anon-news', date: '2024-01-01T00:00:00.000Z' },
        elements: [{ type: 'title', content: 'Anon Title', titleSize: 'h3' }]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id, '/news/anon-news')
    await expect(page.getByText('Anon Title')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('link', { name: /Éditer|Edit/ })).toHaveCount(0)
  })

  test('visible to admin owner on news page', async ({ page, goToPortalWithAuth }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Edit Btn Admin Portal', menu: { children: [] } }
    })).data
    const newsPage = (await user1.post('/api/pages', {
      type: 'news',
      config: {
        title: 'Admin News',
        newsMetadata: { slug: 'admin-news', date: '2024-01-01T00:00:00.000Z' },
        elements: [{ type: 'title', content: 'Admin Title', titleSize: 'h3' }]
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToPortalWithAuth(portal._id, '/news/admin-news', 'test_admin')
    await expect(page.getByText('Admin Title')).toBeVisible({ timeout: 10000 })

    const link = page.getByRole('link', { name: /Éditer|Edit/ })
    await expect(link).toBeVisible({ timeout: 10000 })
    await expect(link).toHaveAttribute('href', new RegExp(`/data-fair/page/${newsPage._id}$`))
    await expect(link).toHaveAttribute('target', '_blank')
  })
})
