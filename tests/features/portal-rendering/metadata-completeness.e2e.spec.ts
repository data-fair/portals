// The metadata completeness score is computed by data-fair when the dataset owner activated it in
// the settings; the portal shows it on the dataset cards and pages when its own options ask for it.
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'
import { dataFairUrl, deleteDatasets, seedDataset } from '../../support/data-fair.ts'

const user1 = await axiosAuth('test_admin@test.com')
const settingsUrl = `${dataFairUrl}/api/v1/settings/user/test_admin`
const seeded: string[] = []
let initialDatasetsMetadata: unknown

test.describe('metadata completeness score', () => {
  test.beforeAll(async () => {
    initialDatasetsMetadata = (await user1.get(settingsUrl)).data.datasetsMetadata
    // before seeding: the score is computed when the dataset is written
    await user1.patch(settingsUrl, { datasetsMetadata: { completeness: { active: true } } })
  })
  test.afterAll(async () => {
    await deleteDatasets(seeded)
    await user1.patch(settingsUrl, { datasetsMetadata: initialDatasetsMetadata ?? {} })
  })
  test.beforeEach(clean)

  test('shown on the dataset cards and pages, with the detail of its criteria', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'Completeness Portal',
        menu: { children: [] },
        datasets: { card: { showMetadataQuality: true }, page: { metadata: { showMetadataQuality: true } } }
      }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [{ type: 'datasets-list', mode: 'lastUpdated', limit: 1, columns: 1, usePortalConfig: true }] },
      portals: [portal._id],
      owner: portal.owner
    })
    const id = await seedDataset(portal._id, { id: `test-completeness-${Date.now()}`, title: 'Jeu noté', summary: 'Court' })
    seeded.push(id)
    const { score } = (await user1.get(`${dataFairUrl}/api/v1/datasets/${id}`)).data.completeness

    await goToPortal(portal._id)
    await expect(page.getByText(`Score de complétion des métadonnées ${score} %`)).toBeVisible({ timeout: 20_000 })

    await goToPortal(portal._id, `/datasets/${id}`)
    const detail = page.getByRole('button', { name: 'Détail du score de complétion des métadonnées' })
    await expect(detail).toBeVisible({ timeout: 20_000 })
    const row = detail.locator('..')
    await expect(row.getByText(`${score} %`)).toBeVisible()

    // the percentage keeps off the right edge as much as the icon of the button off the left one
    const gaps = await row.evaluate(el => {
      const box = el.getBoundingClientRect()
      return {
        left: el.querySelector('button svg path')!.getBoundingClientRect().left - box.left,
        right: box.right - el.lastElementChild!.lastElementChild!.getBoundingClientRect().right
      }
    })
    expect(Math.abs(gaps.right - gaps.left)).toBeLessThan(3)

    // a click before hydration is lost
    await expect(async () => {
      if (await detail.getAttribute('aria-expanded') !== 'true') await detail.click()
      await expect(detail).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
    }).toPass()
    const menu = page.locator('.v-overlay--active')
    await expect(menu.getByText('Résumé', { exact: true })).toBeVisible()
    await expect(menu.getByText(/^5 caractères · \d+ à \d+ recommandés$/)).toBeVisible()
    await expect(menu.getByText('Non renseignée').first()).toBeVisible()
  })
})
