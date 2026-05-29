import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('custom agent block', () => {
  test.beforeEach(clean)

  test('renders an inline agent iframe with composed title and prompt', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Block Portal', menu: { children: [] }, agentChat: { active: false } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: {
        title: 'Home',
        elements: [{
          uuid: 'ca1',
          type: 'custom-agent',
          title: 'Health helper',
          systemPrompt: 'You help explore health data.',
          focusDatasets: [{ id: 'ds-health', title: 'Health DS' }],
          height: 480
        }]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)

    const frame = page.locator('iframe[src*="/agents/"][src*="/chat"]')
    await expect(frame).toBeVisible({ timeout: 15_000 })

    // DfAgentChatBlock (lib 0.6.0) does NOT pass title/prompt via URL query.
    // It calls setAgentInitConfig(key, { prompt, title }) -> sessionStorage
    // ['agent-init-config-block'] and adds ?initConfig=block to the iframe src.
    const src = await frame.getAttribute('src')
    expect(src).toContain('initConfig=')

    const stored = await page.evaluate(() => {
      const raw = sessionStorage.getItem('agent-init-config-block')
      return raw ? JSON.parse(raw) : null
    })
    expect(stored?.title).toBe('Health helper')
    expect(stored?.prompt).toContain('You help explore health data.')
    expect(stored?.prompt).toContain('ds-health')
  })
})
