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
    // nothing to undo either: the form filling itself in as it opens is not a change (a judged
    // run found « Annuler le dernier changement » enabled before anything was edited)
    const undo = page.locator('button[title="Annuler le dernier changement"]')
    await page.waitForTimeout(2000)
    await expect(undo).toBeDisabled()

    const patchResponse = page.waitForResponse(response =>
      response.url().includes(`/api/pages/${createdPage._id}`) && response.request().method() === 'PATCH' && response.ok()
    )
    await page.getByLabel('Titre').fill('Draft Actions Page renamed')
    await page.getByLabel('Titre').blur()
    await patchResponse

    await expect(validate).toHaveAttribute('aria-disabled', 'false')
    await expect(undo).toBeEnabled()
    // undoing restores the previous value without an input: it must still be saved
    const undoPatch = page.waitForResponse(response =>
      response.url().includes(`/api/pages/${createdPage._id}`) && response.request().method() === 'PATCH' && response.ok()
    )
    await undo.click()
    await undoPatch
    await expect(validate).toHaveAttribute('aria-disabled', 'true')
    expect((await user1.get(`/api/pages/${createdPage._id}`)).data.draftConfig.title).toBe('Draft Actions Page')
    // and redone
    const redoPatch = page.waitForResponse(response =>
      response.url().includes(`/api/pages/${createdPage._id}`) && response.request().method() === 'PATCH' && response.ok()
    )
    await page.locator('button[title="Rétablir le dernier changement"]').click()
    await redoPatch
    await expect(validate).toHaveAttribute('aria-disabled', 'false')
    await validate.click()
    await expect(page.getByText('Le brouillon a été validé')).toBeVisible()
    await expect(validate).toHaveAttribute('aria-disabled', 'true')

    const saved = (await user1.get(`/api/pages/${createdPage._id}`)).data
    expect(saved.config.title).toBe('Draft Actions Page renamed')
  })
})

test.describe('validating while the page draft is being saved', () => {
  test.beforeEach(clean)

  test('validating right after an edit publishes that edit, once it is saved', async ({ page, goToWithAuth }) => {
    // the validation used to be sent at once and could reach the API before the save of the
    // last edit, publishing the draft without it
    const portal = (await user1.post('/api/portals', { config: { title: 'Quick Page Portal', menu: { children: [] } } })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: { title: 'Quick Page', elements: [], genericMetadata: { slug: 'quick-page' } },
      portals: [portal._id],
      owner: portal.owner
    })).data
    await goToWithAuth(`/portals-manager/pages/${createdPage._id}/edit-config`, 'test_admin')
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 30_000 })
    // a first edit, saved: the draft differs and « Valider le brouillon » is enabled
    const firstPatch = page.waitForResponse(response =>
      response.url().includes(`/api/pages/${createdPage._id}`) && response.request().method() === 'PATCH' && response.ok()
    )
    await page.getByLabel('Titre').fill('Quick Page 1')
    await page.getByLabel('Titre').blur()
    await firstPatch
    // then a slow save, so that the click lands while it runs
    await page.route(`**/api/pages/${createdPage._id}`, async route => {
      if (route.request().method() === 'PATCH') await new Promise(resolve => setTimeout(resolve, 1500))
      await route.continue()
    })
    await page.getByLabel('Titre').fill('Quick Page 2')
    await page.getByLabel('Titre').blur()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Valider le brouillon' }).click({ force: true })
    await expect(page.getByText('Le brouillon a été validé')).toBeVisible({ timeout: 10_000 })
    expect((await user1.get(`/api/pages/${createdPage._id}`)).data.config.title).toBe('Quick Page 2')
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

  test('validating right after an edit publishes that edit, once it is saved', async ({ page, goToWithAuth }) => {
    // a judged run: the person typed a menu label and clicked « Valider le brouillon » while the
    // draft was being saved; the button was disabled for that instant, the click did nothing
    // and the published portal kept its old menu
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Quick Portal', menu: { children: [] } }
    })).data
    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    const title = page.getByLabel('Titre', { exact: true })
    await expect(title).toBeVisible({ timeout: 30_000 })
    await page.waitForTimeout(3000)
    // a slow save, so that the click lands while it runs
    await page.route(`**/api/portals/${portal._id}`, async route => {
      if (route.request().method() === 'PATCH') await new Promise(resolve => setTimeout(resolve, 1500))
      await route.continue()
    })
    await title.fill('Quick Portal renamed')
    await title.blur()
    await page.waitForTimeout(300)
    // force: a person's click lands whatever the button's state, as the simulation's did
    await page.getByRole('button', { name: 'Valider le brouillon' }).click({ force: true })
    await expect(page.getByText('Le brouillon a été validé')).toBeVisible({ timeout: 10_000 })
    expect((await user1.get(`/api/portals/${portal._id}`)).data.config.title).toBe('Quick Portal renamed')
  })
})

// Judged simulation: the form sub-agent added a menu row and removed it, and « Valider le
// brouillon » stayed lit with nothing to validate. Each edit saved the form's copy of the
// config, which carries the defaults the form fills in as it opens.
test.describe('draft actions of the portal editor', () => {
  test.beforeEach(clean)

  test('an edit undone by hand leaves nothing to validate', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Back And Forth Portal', menu: { children: [] } } })).data
    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    const title = page.getByLabel('Titre', { exact: true })
    await expect(title).toBeVisible({ timeout: 30_000 })
    const validate = page.getByRole('button', { name: 'Valider le brouillon' })
    await expect(validate).toHaveAttribute('aria-disabled', 'true')

    const saved = () => page.waitForResponse(response =>
      response.url().includes(`/api/portals/${portal._id}`) && response.request().method() === 'PATCH' && response.ok()
    )
    let patch = saved()
    await title.fill('Back And Forth Portal renamed')
    await title.blur()
    await patch
    await expect(validate).toHaveAttribute('aria-disabled', 'false')

    patch = saved()
    await title.fill('Back And Forth Portal')
    await title.blur()
    await patch
    await expect(validate).toHaveAttribute('aria-disabled', 'true')
  })
})

// Judged simulation: after the assistant's form tools changed the page, « Annuler le dernier
// changement » stayed disabled. Their edits reach the visible form as outside data, which the
// editor took for the form filling itself in as it opens: it reset the undo history.
test.describe('undoing an edit of the assistant', () => {
  test.beforeEach(clean)

  test('an edit made by the form tools before any by the person can be undone', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Undo Portal', menu: { children: [] } } })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: { title: 'Undo Page', elements: [], genericMetadata: { slug: 'undo-page' } },
      portals: [portal._id],
      owner: portal.owner
    })).data
    await goToWithAuth(`/portals-manager/pages/${createdPage._id}/edit-config`, 'test_admin')
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 30_000 })
    await page.waitForFunction(() => (navigator as any).modelContext?.listTools?.().some((t: any) => t.name === 'pageConfig_setFieldValue'), undefined, { timeout: 30_000 })
    const undo = page.locator('button[title="Annuler le dernier changement"]')
    await expect(undo).toBeDisabled()

    const saved = page.waitForResponse(response =>
      response.url().includes(`/api/pages/${createdPage._id}`) && response.request().method() === 'PATCH' && response.ok()
    )
    await page.evaluate(() => (navigator as any).modelContext.callTool({
      name: 'pageConfig_setFieldValue',
      arguments: { path: '/$comp-1/title', value: 'Undo Page by the assistant' }
    }))
    await saved
    await expect(page.getByLabel('Titre')).toHaveValue('Undo Page by the assistant')
    await expect(undo).toBeEnabled()
    await undo.click()
    await expect(page.getByLabel('Titre')).toHaveValue('Undo Page')
  })
})
