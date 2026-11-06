import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

// A new block starts as a text block and keeps the keys it shares with the type then chosen:
// a default of the text block that is invalid on the new type made the form invalid, and the
// block was silently not saved.
test.describe('the type of a new page block', () => {
  // the vjsf page editor loads in 10-25 s on a busy dev env
  test.slow()
  test.beforeEach(clean)

  test('can be changed from text and is saved to the draft', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Switch Portal', menu: { children: [] } } })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: { title: 'Switch Page', elements: [], genericMetadata: { slug: 'switch-page' } },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToWithAuth(`/portals-manager/pages/${createdPage._id}/edit-config`, 'test_admin')
    const blockTypes = [['Grille de blocs', 'responsive-grid'], ['Onglets', 'tabs'], ['Deux colonnes', 'two-columns']]
    for (const [label] of blockTypes) {
      await page.getByRole('button', { name: 'Ajouter un bloc à la page' }).click({ timeout: 30_000 })
      const blockType = page.getByRole('dialog').getByRole('combobox', { name: 'Type de bloc' })
      await blockType.fill(label)
      await page.getByRole('option', { name: label }).click()
      await page.getByRole('dialog').getByRole('button', { name: 'Fermer' }).click()
    }

    await expect(page.getByText('Dernière modification non enregistrée')).toBeHidden()
    await expect.poll(async () => {
      const { draftConfig } = (await user1.get(`/api/pages/${createdPage._id}`)).data
      return draftConfig.elements.map((element: { type: string }) => element.type)
    }).toEqual(blockTypes.map(([, type]) => type))
  })
})
