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
    }, undefined, { timeout: 15_000 })

    const toolNames = await page.evaluate(() =>
      (navigator as any).modelContext.listTools().map((t: any) => t.name))
    expect(toolNames).toContain('list_datasets')
    expect(toolNames).toContain('navigate')

    // ...and so is the portal's guidance, as keyed host state (agents libs 0.7 ignore a
    // host-supplied system prompt): answered on the tab channel like the chat asks for it.
    const state = await page.evaluate(async () => {
      const channelId = sessionStorage.getItem('mcpTabChannelId')
      const ch = new BroadcastChannel(channelId!)
      const state: Record<string, string> = {}
      ch.onmessage = (e) => {
        const data = e.data
        if (data?.channel === channelId && data.type === 'agent-event' && data.event?.key) state[data.event.key] = data.event.detail
      }
      ch.postMessage({ channel: channelId, type: 'agent-state-request' })
      await new Promise(resolve => setTimeout(resolve, 500))
      ch.close()
      return state
    })
    expect(state.portal).toContain('« Tools Always On »')
    expect(state['portal-data']).toContain('never invent or estimate data')
    expect(state['portal-screen']).toContain('get_current_location')
    expect(state['portal-links']).toContain('absolute URL')
  })
})
