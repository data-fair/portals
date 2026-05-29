import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('agent tools are always on', () => {
  test.beforeEach(clean)

  test('base tools register even when the global chat is disabled', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'Tools Always On',
        menu: { children: [] },
        agentChat: { active: false }
      }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [{ uuid: 'h1', type: 'title', content: 'Hello', titleSize: 'h2' }] },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    await expect(page.getByText('Hello')).toBeVisible({ timeout: 15_000 })

    // The global chat toggle must NOT be shown...
    await expect(page.locator('.df-agent-chat-toggle')).toHaveCount(0)

    // ...but the WebMCP base tools must still be registered.
    await page.waitForFunction(() => {
      const mc = (navigator as any).modelContext
      return mc && typeof mc.listTools === 'function' &&
        mc.listTools().some((t: any) => t.name === 'list_datasets')
    }, { timeout: 15_000 })

    const toolNames = await page.evaluate(() =>
      (navigator as any).modelContext.listTools().map((t: any) => t.name))
    expect(toolNames).toContain('list_datasets')
    expect(toolNames).toContain('navigate')
  })
})
