// Static filters of an application block are appended to the d-frame src only, so they
// reach the application without ever showing in the page URL.
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

const application = { id: 'no-such-app', slug: 'no-such-app', title: 'Missing app' }

test.describe('application block static filters', () => {
  test.beforeEach(clean)

  test('the filters go to the frame src, not to the page URL', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'App Static Filters Portal', menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: {
        title: 'Home',
        elements: [{
          uuid: 'app1',
          type: 'application',
          application,
          syncParams: 'sandboxed',
          staticFilters: [
            { key: '_c_commune_in', value: 'Vannes,Lorient' },
            { key: '_d_my-dataset_year_gte', value: '2020' }
          ]
        }]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    const frame = page.locator('d-frame')
    await expect(frame).toHaveCount(1, { timeout: 15_000 })
    const src = new URL(await frame.getAttribute('src') ?? '', 'http://localhost')
    expect(src.pathname).toBe('/data-fair/app/no-such-app')
    expect(src.searchParams.get('_c_commune_in')).toBe('Vannes,Lorient')
    expect(src.searchParams.get('_d_my-dataset_year_gte')).toBe('2020')
    expect(src.searchParams.get('d-frame')).toBe('true')
    expect(page.url()).not.toContain('_c_commune_in')
  })
})
