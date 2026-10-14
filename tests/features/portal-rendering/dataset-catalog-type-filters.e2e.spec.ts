// The "available data" filter and the static dataset types both narrow the data-fair query.
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('datasets catalog type filters', () => {
  test.beforeEach(clean)

  test('the queryable checkbox and the static types reach data-fair', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Type Filters Portal', menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'datasets',
      config: {
        title: 'Catalogue',
        elements: [{
          uuid: 'dc1',
          type: 'datasets-catalog',
          columns: 2,
          filters: { items: ['queryable'] },
          staticFilters: { types: ['file', 'rest'] }
        }]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    const queries: URLSearchParams[] = []
    page.on('request', request => {
      const url = new URL(request.url())
      if (url.pathname === '/data-fair/api/v1/datasets') queries.push(url.searchParams)
    })

    await goToPortal(portal._id, '/datasets')
    const checkbox = page.getByRole('checkbox', { name: 'Données disponibles' })
    await expect(checkbox).toBeVisible({ timeout: 10_000 })

    // a click before hydration only toggles the native input, retry until the URL follows
    await expect.poll(async () => {
      if (!page.url().includes('queryable=1')) await checkbox.click()
      return queries.some(q => q.get('queryable') === 'true')
    }, { timeout: 15_000 }).toBe(true)
    const query = queries.find(q => q.get('queryable') === 'true')!
    expect(query.get('type')).toBe('file,rest')
  })
})
