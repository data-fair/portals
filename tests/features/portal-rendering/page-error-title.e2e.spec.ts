import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('content 404 document title', () => {
  test.beforeEach(clean)

  test('a missing content page gets a distinct document title', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Erreur Portal', menu: { children: [] } }
    })).data

    await goToPortal(portal._id, '/pages/page-inexistante')
    await expect(page).toHaveTitle('Page introuvable - Erreur Portal', { timeout: 10_000 })
    await expect(page.getByRole('heading', { name: 'La page demandée n\'existe pas.' })).toBeVisible()
  })
})
