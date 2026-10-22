import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('pages UI', () => {
  test.beforeEach(clean)

  test('should display empty state when no pages exist', async ({ page, goToWithAuth }) => {
    await goToWithAuth('/portals-manager/pages', 'test_admin')
    await expect(page.getByText('Vous n\'avez pas encore créé de page')).toBeVisible({ timeout: 10_000 })
  })

  test('should display pages list', { tag: '@smoke' }, async ({ page, goToWithAuth }) => {
    // Create a portal and page via API
    const portal = (await user1.post('/api/portals', { config: { title: 'Portal for pages', menu: { children: [] } } })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home Page E2E', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToWithAuth('/portals-manager/pages', 'test_admin')
    await expect(page.getByText('Home Page E2E')).toBeVisible({ timeout: 10_000 })
  })
})
