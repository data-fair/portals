import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

// Judged simulations: a block the assistant added in the page editor was gone from the page
// view's draft preview, and from the editor reopened from there. Both read the page store of
// the parent route, loaded once: the draft saved by the editor never reached it.
test.describe('page store', () => {
  test.beforeEach(clean)

  test('the page view and the reopened editor show the draft the editor saved', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Store Portal', menu: { children: [] } } })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: { title: 'Store Page', elements: [{ type: 'text', content: 'Texte publié.' }], genericMetadata: { slug: 'store-page' } },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToWithAuth(`/portals-manager/pages/${createdPage._id}`, 'test_admin')
    await page.getByRole('link', { name: 'Éditer le brouillon' }).click({ timeout: 30_000 })
    await expect(page.getByLabel('Titre')).toHaveValue('Store Page', { timeout: 30_000 })
    const patched = page.waitForResponse(response =>
      response.url().includes(`/api/pages/${createdPage._id}`) && response.request().method() === 'PATCH' && response.ok()
    )
    await page.getByLabel('Titre').fill('Store Page renamed')
    await page.getByLabel('Titre').blur()
    await patched

    // back to the page view, in the application: the parent route and its store stay
    await page.goBack()
    await expect(page.getByRole('link', { name: 'Éditer le brouillon' })).toBeVisible()
    await page.getByRole('link', { name: 'Éditer le brouillon' }).click()
    await expect(page.getByLabel('Titre')).toHaveValue('Store Page renamed')
  })
})
