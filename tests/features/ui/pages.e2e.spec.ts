import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('admin@test.com')

test.describe('pages UI', () => {
  test.beforeEach(clean)

  test('should display empty state when no pages exist', async ({ page, goToWithAuth }) => {
    await goToWithAuth('/portals-manager/pages', 'admin')
    await expect(page.getByText('Vous n\'avez pas encore créé de page')).toBeVisible({ timeout: 10000 })
  })

  test('should display pages list', async ({ page, goToWithAuth }) => {
    // Create a portal and page via API
    const portal = (await user1.post('/api/portals', { config: { title: 'Portal for pages', menu: { children: [] } } })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home Page E2E', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToWithAuth('/portals-manager/pages', 'admin')
    await expect(page.getByText('Home Page E2E')).toBeVisible({ timeout: 10000 })
  })

  test('should load page detail view', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Portal for page view', menu: { children: [] } } })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'My Home Page', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToWithAuth(`/portals-manager/pages/${createdPage._id}`, 'admin')
    // The page detail view shows tabs for preview, publications, etc.
    await expect(page.getByRole('tab', { name: 'Aperçu', exact: true })).toBeVisible({ timeout: 10000 })
  })
})
