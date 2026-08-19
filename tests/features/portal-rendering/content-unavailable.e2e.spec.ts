import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('data-fair content unavailable', () => {
  test.beforeEach(clean)

  test('a catalog warns instead of showing an empty result when data-fair cannot be reached', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Data Fair Down Portal', menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'datasets',
      config: {
        title: 'Catalogue',
        elements: [{ uuid: 'dc1', type: 'datasets-catalog', columns: 2, filters: { items: ['search'] } }]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id, '/datasets')
    const search = page.getByRole('textbox', { name: 'Rechercher', exact: true })
    await expect(search).toBeVisible({ timeout: 10_000 })

    // data-fair is down: the search cannot be answered anymore
    await page.route('**/data-fair/api/**', route => route.abort())

    // a search submitted before hydration does nothing, retry with a new term each time
    // (the search field is gone once the warning replaced the catalog)
    const warning = page.getByText('Contenu temporairement indisponible')
    let attempt = 0
    await expect.poll(async () => {
      if (await warning.isVisible()) return true
      await search.fill(`recherche-${attempt++}`)
      await search.press('Enter')
      return warning.isVisible()
    }, { timeout: 20_000 }).toBe(true)
  })
})
