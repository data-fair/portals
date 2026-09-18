import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('portal rendering', () => {
  test.beforeEach(clean)

  test('should render home page with title element', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Test Portal Home', menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Welcome', elements: [{ type: 'title', content: 'Hello E2E Portal', titleSize: 'h2' }] },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    await expect(page.getByText('Hello E2E Portal')).toBeVisible({ timeout: 10_000 })
  })

  test('should render navigation menu and navigate', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'Nav Test Portal',
        menu: {
          children: [
            { type: 'standard', subtype: 'datasets' },
            { type: 'standard', subtype: 'contact' }
          ]
        }
      }
    })).data

    // Create home page so the portal has content to render
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })
    // Create contact page
    await user1.post('/api/pages', {
      type: 'contact',
      config: { title: 'Contact', elements: [{ type: 'title', content: 'Contactez-nous', titleSize: 'h3' }] },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    // Menu items should be visible as tabs (French labels since i18n_lang=fr)
    await expect(page.getByRole('tab', { name: 'Catalogue de données' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('tab', { name: 'Contact' })).toBeVisible({ timeout: 10_000 })

    // Click contact tab and verify navigation
    await page.getByRole('tab', { name: 'Contact' }).click()
    await expect(page).toHaveURL(/\/contact/)
    await expect(page.getByText('Contactez-nous')).toBeVisible({ timeout: 10_000 })
  })

  test('should render generic page with title element', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Generic Page Portal', menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'About Us',
        genericMetadata: { slug: 'about-us' },
        elements: [{ type: 'title', content: 'About Our Organization', titleSize: 'h3' }]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id, '/pages/about-us')
    await expect(page.getByText('About Our Organization')).toBeVisible({ timeout: 10_000 })
  })

  test('should render app bar and footer', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Layout Test Portal', menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [{ type: 'title', content: 'Layout Test', titleSize: 'h2' }] },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    // App bar should be present
    await expect(page.locator('.v-app-bar, .v-toolbar')).toBeVisible({ timeout: 10_000 })
    // Footer should be present
    await expect(page.locator('#footer')).toBeVisible({ timeout: 10_000 })
  })

  test('should render a footer with rows, columns and every block type', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Footer Test Portal', menu: { children: [] } }
    })).data
    const footer = {
      copyright: true,
      background: { color: 'primary' },
      rows: [
        {
          columns: 2,
          disposition: 'right',
          blocks: [
            { type: 'text', align: 'left', markdown: true, content: '**Footer text**' },
            { type: 'social', align: 'center' }
          ],
          blocks2: [
            { type: 'images', align: 'center', height: 40, items: [{ source: 'koumoul' }] },
            { type: 'links', align: 'center', display: 'inline', items: [{ type: 'standard', subtype: 'sitemap', title: 'Site map' }] }
          ]
        },
        {
          columns: 1,
          background: { color: 'secondary' },
          blocks: [
            { type: 'divider', align: 'left', opacity: 0.5, thickness: 2 },
            { type: 'buttons', align: 'center', variant: 'outlined', items: [{ type: 'standard', subtype: 'contact', title: 'Contact us' }] }
          ]
        },
        {
          columns: 2,
          gutter: 'none',
          align: 'center',
          blocks: [{ type: 'text', align: 'left', markdown: false, content: 'Equal column A' }],
          blocks2: [{ type: 'text', align: 'left', markdown: false, content: 'Equal column B' }],
          // a third list left behind by a wider layout is not rendered
          blocks3: [{ type: 'text', align: 'left', markdown: false, content: 'Hidden column C' }]
        }
      ]
    }
    await user1.patch(`/api/portals/${portal._id}`, { draftConfig: { ...portal.draftConfig, footer, socialLinks: { linkedin: 'https://www.linkedin.com/company/koumoul' } } })
    await user1.post(`/api/portals/${portal._id}/draft`)

    await goToPortal(portal._id)
    const footerLocator = page.locator('#footer')
    await expect(footerLocator).toBeVisible({ timeout: 10_000 })
    await expect(footerLocator.locator('strong', { hasText: 'Footer text' })).toBeVisible()
    await expect(footerLocator.getByRole('link', { name: /Site map/ })).toBeVisible()
    await expect(footerLocator.getByRole('link', { name: /Contact us/ })).toBeVisible()
    await expect(footerLocator.locator('img[src*="koumoul.com"]')).toBeVisible()
    await expect(footerLocator.locator('.v-divider')).toHaveCount(2)
    await expect(footerLocator.locator('.bg-secondary')).toBeVisible()
    await expect(footerLocator.getByText(/Koumoul/).last()).toBeVisible()

    // two equal columns share their row on a desktop viewport instead of stacking full width
    await page.setViewportSize({ width: 1280, height: 720 })
    const equalRow = footerLocator.locator('.v-row').filter({ hasText: 'Equal column A' })
    const equalColumns = equalRow.locator('> .v-col')
    await expect(equalColumns).toHaveCount(2)
    await expect(footerLocator.getByText('Hidden column C')).toHaveCount(0)
    const rowBox = (await equalRow.boundingBox())!
    const firstBox = (await equalColumns.first().boundingBox())!
    const secondBox = (await equalColumns.last().boundingBox())!
    expect(firstBox.y).toBe(secondBox.y)
    expect(firstBox.width).toBeLessThanOrEqual(rowBox.width * 0.55)
    expect(secondBox.width).toBeLessThanOrEqual(rowBox.width * 0.55)
  })

  test('should render contact page', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'Contact Page Portal',
        menu: { children: [{ type: 'standard', subtype: 'contact' }] }
      }
    })).data
    await user1.post('/api/pages', {
      type: 'contact',
      config: {
        title: 'Nous contacter',
        elements: [{ type: 'title', content: 'Formulaire de contact', titleSize: 'h3' }]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id, '/contact')
    await expect(page.getByText('Formulaire de contact')).toBeVisible({ timeout: 10_000 })
  })

  test('should fetch the anonymous action token from the browser, not during SSR', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'Contact Form Portal',
        menu: { children: [{ type: 'standard', subtype: 'contact' }] }
      }
    })).data
    await user1.post('/api/pages', {
      type: 'contact',
      config: {
        title: 'Nous contacter',
        elements: [{ type: 'contact' }]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    // fetching the token during SSR would concentrate all portals traffic on a few node IPs
    // and trigger simple-directory's per-IP auth rate limit
    const tokenRequest = page.waitForRequest(
      request => request.url().includes('/simple-directory/api/auth/anonymous-action'),
      { timeout: 10_000 }
    )
    await goToPortal(portal._id, '/contact')
    await tokenRequest
    await expect(page.getByLabel('Email')).toBeVisible({ timeout: 10_000 })
  })
})
