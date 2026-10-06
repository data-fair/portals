import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

// Judged simulation: the assistant took the person back to the page editor with navigate, the
// route lost its ?portal= query, and « Portail de prévisualisation » stayed empty: the default
// portal was only chosen once, when the page was first loaded.
test.describe('the portal a page is previewed on', () => {
  test.beforeEach(clean)

  test('is chosen again when a navigation drops it from the route', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Preview Portal', menu: { children: [] } } })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: { title: 'Preview Page', elements: [], genericMetadata: { slug: 'preview-page' } },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToWithAuth(`/portals-manager/pages/${createdPage._id}/edit-config`, 'test_admin')
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 30_000 })
    await expect(page).toHaveURL(new RegExp(`portal=${portal._id}`))
    // a navigation from outside the app (the shell's navigate tool), to the page view without it
    await page.evaluate((path) => {
      history.pushState(history.state, '', path)
      dispatchEvent(new PopStateEvent('popstate', { state: history.state }))
    }, `/portals-manager/pages/${createdPage._id}`)
    await expect(page.getByRole('tab', { name: 'Aperçu (brouillon)' })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`portal=${portal._id}`))
  })
})
