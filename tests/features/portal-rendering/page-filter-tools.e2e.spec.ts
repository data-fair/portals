import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('page filter tools', () => {
  test.beforeEach(clean)

  test('pageFilters_set writes a _c_ key and pageFilters_get reads it back', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Filter Tools', menu: { children: [] }, agentChat: { active: false } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [{ uuid: 'h1', type: 'title', content: 'Hello', titleSize: 'h2' }] },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    await expect(page.getByText('Hello')).toBeVisible({ timeout: 15_000 })

    await page.waitForFunction(() => {
      const mc = (navigator as any).modelContext
      return mc?.listTools?.().some((t: any) => t.name === 'pageFilters_set')
    }, { timeout: 15_000 })

    await page.evaluate(async () => {
      await (navigator as any).modelContext.callTool({
        name: 'pageFilters_set',
        arguments: { params: { _c_theme_eq: 'health' } }
      })
    })

    // it should have written to the URL query
    await expect.poll(() => new URL(page.url()).searchParams.get('_c_theme_eq')).toBe('health')

    const got = await page.evaluate(async () => {
      const r = await (navigator as any).modelContext.callTool({ name: 'pageFilters_get', arguments: {} })
      return r?.structuredContent ?? r
    })
    expect(JSON.stringify(got)).toContain('_c_theme_eq')
    expect(JSON.stringify(got)).toContain('health')

    // empty value clears the key
    await page.evaluate(async () => {
      await (navigator as any).modelContext.callTool({
        name: 'pageFilters_set',
        arguments: { params: { _c_theme_eq: '' } }
      })
    })
    await expect.poll(() => new URL(page.url()).searchParams.get('_c_theme_eq')).toBe(null)
  })

  test('a shared-filters dataset-table registers a describe tool, sandboxed does not', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Describe Tools', menu: { children: [] }, agentChat: { active: false } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: {
        title: 'Home',
        elements: [
          { uuid: 'shared1', type: 'dataset-table', dataset: { id: 'ds-shared', title: 'Shared DS' }, syncParams: 'shared-filters', interactions: 'all' },
          { uuid: 'sand1', type: 'dataset-table', dataset: { id: 'ds-sandboxed', title: 'Sandboxed DS' }, syncParams: 'sandboxed', interactions: 'all' }
        ]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    await page.waitForFunction(() => {
      const mc = (navigator as any).modelContext
      return mc?.listTools?.().some((t: any) => t.name === 'pageFilters_get')
    }, { timeout: 15_000 })

    const toolNames = await page.evaluate(() =>
      (navigator as any).modelContext.listTools().map((t: any) => t.name))
    expect(toolNames).toContain('describe_filters_shared1')
    expect(toolNames).not.toContain('describe_filters_sand1')
  })
})
