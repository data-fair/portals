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

// Opening the editor of a new portal filled the schema defaults into the form, saved them
// as a draft and enabled « Valider le brouillon »: a change nobody made, which the
// assistant then warned about (« modifications non publiées ») in judged simulations.
test.describe('draft actions of the portal editor', () => {
  test.beforeEach(clean)

  test('opening a portal saves nothing, an edit makes a draft to validate', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Draft Actions Portal', menu: { children: [] } }
    })).data
    const patches: string[] = []
    page.on('request', request => {
      if (request.method() === 'PATCH' && request.url().includes(`/api/portals/${portal._id}`)) patches.push(request.postData() ?? '')
    })

    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    const title = page.getByLabel('Titre', { exact: true })
    await expect(title).toBeVisible({ timeout: 30_000 })
    const validate = page.getByRole('button', { name: 'Valider le brouillon' })
    await expect(validate).toBeVisible()
    // the form fills its defaults and fetches the account's topics right after opening
    await page.waitForTimeout(3000)
    expect(patches).toEqual([])
    await expect(validate).toHaveAttribute('aria-disabled', 'true')

    const patchResponse = page.waitForResponse(response =>
      response.url().includes(`/api/portals/${portal._id}`) && response.request().method() === 'PATCH' && response.ok()
    )
    await title.fill('Draft Actions Portal renamed')
    await title.blur()
    await patchResponse
    await expect(validate).toHaveAttribute('aria-disabled', 'false')

    await validate.click()
    await expect(page.getByText('Le brouillon a été validé')).toBeVisible()
    await expect(validate).toHaveAttribute('aria-disabled', 'true')
    expect((await user1.get(`/api/portals/${portal._id}`)).data.config.title).toBe('Draft Actions Portal renamed')
  })
})
