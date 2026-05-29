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
        elements: [
          { uuid: 't1', type: 'title', content: 'Assistant page', titleSize: 'h2' },
          {
            uuid: 'ca1',
            type: 'custom-agent',
            title: 'Health helper',
            systemPrompt: 'You help explore health data.',
            focusDatasets: [{ id: 'ds-health', title: 'Health DS' }],
            height: 480
          }
        ]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    await expect(page.getByText('Assistant page')).toBeVisible({ timeout: 15_000 })

    // The block renders the lib's <d-frame> chat component.
    await expect(page.locator('d-frame')).toBeVisible({ timeout: 15_000 })

    // DfAgentChatBlock (lib 0.6.0) does NOT pass title/prompt via URL query.
    // It calls setAgentInitConfig('block', { prompt, title }), which stores under
    // sessionStorage key 'df-agent-init-config:block' (INIT_CONFIG_PREFIX
    // 'df-agent-init-config:' + default initConfigKey 'block') — the reliable
    // signal that the block composed and forwarded the prompt.
    const stored = await page.evaluate(async () => {
      // give the block a moment to run setAgentInitConfig on mount
      for (let i = 0; i < 30; i++) {
        const raw = sessionStorage.getItem('df-agent-init-config:block')
        if (raw) return JSON.parse(raw)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      return null
    })
    expect(stored?.title).toBe('Health helper')
    expect(stored?.prompt).toContain('You help explore health data.')
    expect(stored?.prompt).toContain('ds-health')
  })
})
