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
    await expect(page.getByText('Hello E2E Portal')).toBeVisible({ timeout: 10000 })
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
    await expect(page.getByRole('tab', { name: 'Catalogue de données' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('tab', { name: 'Contact' })).toBeVisible({ timeout: 10000 })

    // Click contact tab and verify navigation
    await page.getByRole('tab', { name: 'Contact' }).click()
    await expect(page).toHaveURL(/\/contact/)
    await expect(page.getByText('Contactez-nous')).toBeVisible({ timeout: 10000 })
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
    await expect(page.getByText('About Our Organization')).toBeVisible({ timeout: 10000 })
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
    await expect(page.locator('.v-app-bar, .v-toolbar')).toBeVisible({ timeout: 10000 })
    // Footer should be present
    await expect(page.locator('#footer')).toBeVisible({ timeout: 10000 })
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
    await expect(page.getByText('Formulaire de contact')).toBeVisible({ timeout: 10000 })
  })
})
