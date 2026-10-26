// The fragments of a meta-only dataset are never published on a portal: the "see also"
// section of the meta-only's page lists them next to its published related datasets.
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'
import { dataFairUrl, deleteDatasets, seedDataset } from '../../support/data-fair.ts'

const user1 = await axiosAuth('test_admin@test.com')
const seeded: string[] = []

test.describe('fragments of a meta-only dataset', () => {
  test.beforeEach(clean)
  test.afterAll(async () => { await deleteDatasets(seeded) })

  test('are shown in the "see also" section of their parent without being published', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Fragments Portal', menu: { children: [] }, datasets: { card: {}, page: { relatedDatasets: { display: 'card' } } } }
    })).data

    const suffix = Date.now()
    const related = await seedDataset(portal._id, { id: `test-related-${suffix}`, title: 'Jeu lié publié' })
    const parent = await seedDataset(portal._id, { id: `test-meta-only-${suffix}`, title: 'Jeu parent' })
    seeded.push(related, parent)
    await user1.patch(`${dataFairUrl}/api/v1/datasets/${parent}`, { relatedDatasets: [{ id: related, title: 'Jeu lié publié' }] })
    // created after the parent became public: it inherits its read permission, but no publication site
    const fragment = (await user1.post(`${dataFairUrl}/api/v1/datasets/test-fragment-${suffix}`, {
      isMetaOnly: true,
      title: 'Jeu enfant',
      partOf: { type: 'dataset', id: parent }
    })).data.id
    seeded.unshift(fragment)

    await goToPortal(portal._id, `/datasets/${parent}`)
    await expect(page.getByText('Voir plus')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.v-card').filter({ hasText: 'Jeu lié publié' })).toBeVisible()
    await expect(page.locator('.v-card').filter({ hasText: 'Jeu enfant' })).toBeVisible()
  })
})
