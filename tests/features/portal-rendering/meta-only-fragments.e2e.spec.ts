// The fragments of a meta-only dataset are never published on a portal: the page of their parent
// lists them in a "child datasets" section, before the "see also" one.
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'
import { dataFairUrl, deleteDatasets, seedDataset } from '../../support/data-fair.ts'

const user1 = await axiosAuth('test_admin@test.com')
const seeded: string[] = []

test.describe('fragments of a meta-only dataset', () => {
  test.beforeEach(clean)
  test.afterAll(async () => { await deleteDatasets(seeded) })

  test('are listed in the "child datasets" section of their parent, without being published', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Fragments Portal', menu: { children: [] }, breadcrumb: { position: 'below-nav' }, datasets: { card: {}, page: { relatedDatasets: { display: 'card' }, reuses: { display: 'card', inviteUserReuses: true } } } }
    })).data

    const suffix = Date.now()
    const related = await seedDataset(portal._id, { id: `test-related-${suffix}`, title: 'Jeu lié publié' })
    const parent = await seedDataset(portal._id, { id: `test-meta-only-${suffix}`, title: 'Jeu parent' })
    seeded.push(related, parent)
    // created after the parent became public: they inherit its read permission, but no publication site
    const createFragment = async (id: string, title: string) => (await user1.post(`${dataFairUrl}/api/v1/datasets/${id}`, {
      isMetaOnly: true,
      title,
      partOf: { type: 'dataset', id: parent }
    })).data.id
    seeded.unshift(await createFragment(`test-fragment-a-${suffix}`, 'Arrêts'), await createFragment(`test-fragment-b-${suffix}`, 'Horaires'))
    await user1.patch(`${dataFairUrl}/api/v1/datasets/${parent}`, { relatedDatasets: [{ id: related, title: 'Jeu lié publié' }] })

    await goToPortal(portal._id, `/datasets/${parent}`)
    const childSection = page.getByRole('heading', { name: 'Jeux enfants' })
    await expect(childSection).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.v-card').filter({ hasText: 'Arrêts' })).toBeVisible()
    await expect(page.locator('.v-card').filter({ hasText: 'Horaires' })).toBeVisible()
    // the related datasets come after the child datasets
    const seeAlso = page.getByRole('heading', { name: 'Voir plus' })
    await expect(seeAlso).toBeVisible()
    expect((await childSection.boundingBox())!.y).toBeLessThan((await seeAlso.boundingBox())!.y)
    await expect(page.getByRole('heading', { name: 'Réutilisation associée' })).toBeVisible()

    await page.locator('.v-card').filter({ hasText: 'Arrêts' }).getByRole('link').first().click()
    await expect(page.getByRole('heading', { name: 'Arrêts' })).toBeVisible()
    await expect(page.locator('.v-breadcrumbs').getByRole('link', { name: 'Jeu parent' })).toBeVisible()
    // a fragment can't be picked in a reuse, the invitation would lead nowhere
    await expect(page.getByRole('heading', { name: 'Réutilisation associée' })).toHaveCount(0)

    // the back link of a fragment leads to its parent, not to the catalog
    await page.getByRole('link', { name: 'Revenir à Jeu parent' }).click()
    await expect(page.getByRole('heading', { name: 'Jeux enfants' })).toBeVisible()
  })
})
