import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('admin@test.com')

test.describe('portals UI', () => {
  test.beforeEach(clean)

  test('should display empty state when no portals exist', async ({ page, goToWithAuth }) => {
    await goToWithAuth('/portals-manager/portals', 'admin')
    await expect(page.getByText('Vous n\'avez pas encore créé de portail')).toBeVisible({ timeout: 10000 })
  })

  test('should display portals list', async ({ page, goToWithAuth }) => {
    // Create a portal via API
    await user1.post('/api/portals', { config: { title: 'Test Portal E2E', menu: { children: [] } } })

    await goToWithAuth('/portals-manager/portals', 'admin')
    await expect(page.getByText('Test Portal E2E')).toBeVisible({ timeout: 10000 })
  })

  test('should load portal settings page', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Portal Settings Test', menu: { children: [] } } })).data

    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'admin')
    // The portal settings page shows a vjsf form, wait for it to load
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 })
  })
})
