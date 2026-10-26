// The fragments of a meta-only dataset are never published on a portal: the "see also"
// section of the meta-only's page lists those it declares as related datasets, next to the published ones.
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'
import { dataFairUrl, deleteDatasets, seedDataset } from '../../support/data-fair.ts'

const user1 = await axiosAuth('test_admin@test.com')
const seeded: string[] = []

test.describe('fragments of a meta-only dataset', () => {
  test.beforeEach(clean)
  test.afterAll(async () => { await deleteDatasets(seeded) })

  test('are shown in the "see also" section of their parent when related, without being published', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Fragments Portal', menu: { children: [] }, datasets: { card: {}, page: { relatedDatasets: { display: 'card' } } } }
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
    const linkedFragment = await createFragment(`test-fragment-linked-${suffix}`, 'Jeu enfant lié')
    const unlinkedFragment = await createFragment(`test-fragment-unlinked-${suffix}`, 'Jeu enfant non lié')
    seeded.unshift(linkedFragment, unlinkedFragment)
    await user1.patch(`${dataFairUrl}/api/v1/datasets/${parent}`, {
      relatedDatasets: [{ id: related, title: 'Jeu lié publié' }, { id: linkedFragment, title: 'Jeu enfant lié' }]
    })

    await goToPortal(portal._id, `/datasets/${parent}`)
    await expect(page.getByText('Voir plus')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.v-card').filter({ hasText: 'Jeu lié publié' })).toBeVisible()
    await expect(page.locator('.v-card').filter({ hasText: 'Jeu enfant lié' })).toBeVisible()
    // a fragment is shown only when the parent also declares it as a related dataset
    await expect(page.locator('.v-card').filter({ hasText: 'Jeu enfant non lié' })).toHaveCount(0)
  })
})
