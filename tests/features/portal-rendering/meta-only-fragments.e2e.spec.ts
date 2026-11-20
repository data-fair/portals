// The fragments of a meta-only dataset are never published on a portal: the page of their parent
// gives their actions in one accordion panel per fragment, in its metadata card.
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'
import { dataFairUrl, deleteDatasets, seedDataset } from '../../support/data-fair.ts'

const user1 = await axiosAuth('test_admin@test.com')
const seeded: string[] = []

test.describe('fragments of a meta-only dataset', () => {
  test.beforeEach(clean)
  test.afterAll(async () => { await deleteDatasets(seeded) })

  test('give their actions in the metadata of their parent, without being published', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Fragments Portal', menu: { children: [] }, breadcrumb: { position: 'below-nav' }, datasets: { card: {}, page: { metadata: { actionButtons: ['table', 'api'] }, reuses: { display: 'card', inviteUserReuses: true } } } }
    })).data

    const suffix = Date.now()
    const parent = await seedDataset(portal._id, { id: `test-meta-only-${suffix}`, title: 'Jeu parent' })
    seeded.push(parent)
    // created after the parent became public: they inherit its read permission, but no publication site
    const createFragment = async (id: string, title: string) => (await user1.post(`${dataFairUrl}/api/v1/datasets/${id}`, {
      isMetaOnly: true,
      title,
      partOf: { type: 'dataset', id: parent }
    })).data.id
    seeded.unshift(await createFragment(`test-fragment-a-${suffix}`, 'Arrêts'), await createFragment(`test-fragment-b-${suffix}`, 'Horaires'))

    await goToPortal(portal._id, `/datasets/${parent}`)
    const panelA = page.getByRole('button', { name: 'Arrêts' })
    const panelB = page.getByRole('button', { name: 'Horaires' })
    await expect(panelA).toBeVisible({ timeout: 20_000 })
    await expect(panelB).toBeVisible()

    // one panel open at a time
    // a click before hydration is lost
    await expect(async () => {
      if (await panelA.getAttribute('aria-expanded') !== 'true') await panelA.click()
      await expect(panelA).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
    }).toPass()
    await panelB.click()
    await expect(panelB).toHaveAttribute('aria-expanded', 'true')
    await expect(panelA).toHaveAttribute('aria-expanded', 'false')

    await page.getByRole('link', { name: 'Horaires - Ouvrir la documentation d\'API en pleine page' }).click()
    // the page of a fragment is skipped: its sub-pages hang on its parent
    const breadcrumbs = page.locator('.v-breadcrumbs')
    await expect(breadcrumbs.getByText('Horaires - Documentation de l\'API')).toBeVisible()
    await breadcrumbs.getByRole('link', { name: 'Jeu parent' }).click()
    await expect(panelA).toBeVisible()
  })

  test('have no page of their own, it leads to their parent', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Fragments Portal', menu: { children: [] }, datasets: { card: {}, page: {} } }
    })).data

    const suffix = Date.now()
    const parent = await seedDataset(portal._id, { id: `test-meta-only-${suffix}`, title: 'Jeu parent' })
    seeded.push(parent)
    const fragment = (await user1.post(`${dataFairUrl}/api/v1/datasets/test-fragment-${suffix}`, {
      isMetaOnly: true,
      title: 'Arrêts',
      partOf: { type: 'dataset', id: parent }
    })).data.id
    seeded.unshift(fragment)

    await goToPortal(portal._id, `/datasets/${fragment}`)
    await expect(page.getByRole('heading', { name: 'Jeu parent' })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('button', { name: 'Arrêts' })).toBeVisible()
    expect(new URL(page.url()).pathname).toBe(`/datasets/${parent}`)
  })
})
