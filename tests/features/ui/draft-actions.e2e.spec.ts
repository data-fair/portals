import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

// Judged simulations: people clicked « Valider le brouillon », saw nothing happen and
// concluded nothing was saved, although the draft had been published. The action was
// a list item without a button role and validating gave no feedback at all.
test.describe('draft actions of the page editor', () => {
  test.beforeEach(clean)

  test('validating the draft is a button that confirms and then disables itself', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Draft Actions Portal', menu: { children: [] } }
    })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: { title: 'Draft Actions Page', elements: [], genericMetadata: { slug: 'draft-actions' } },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToWithAuth(`/portals-manager/pages/${createdPage._id}/edit-config`, 'test_admin')
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 30_000 })

    const validate = page.getByRole('button', { name: 'Valider le brouillon' })
    // nothing to publish yet
    await expect(validate).toHaveAttribute('aria-disabled', 'true')

    const patchResponse = page.waitForResponse(response =>
      response.url().includes(`/api/pages/${createdPage._id}`) && response.request().method() === 'PATCH' && response.ok()
    )
    await page.getByLabel('Titre').fill('Draft Actions Page renamed')
    await page.getByLabel('Titre').blur()
    await patchResponse

    await expect(validate).toHaveAttribute('aria-disabled', 'false')
    await validate.click()
    await expect(page.getByText('Le brouillon a été validé')).toBeVisible()
    await expect(validate).toHaveAttribute('aria-disabled', 'true')

    const saved = (await user1.get(`/api/pages/${createdPage._id}`)).data
    expect(saved.config.title).toBe('Draft Actions Page renamed')
  })
})
