import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('agent chat visibility', () => {
  test.beforeEach(clean)

  test.skip('anonymous visitor sees the toggle when visibleTo includes anonymous', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'Agent Chat Anon Visible',
        menu: { children: [] },
        agentChat: { active: true, visibleTo: ['anonymous'] }
      }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [{ type: 'title', content: 'Hello', titleSize: 'h2' }] },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    await expect(page.getByText('Hello')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.df-agent-chat-toggle')).toBeVisible({ timeout: 10000 })
  })

  test('anonymous visitor does not see the toggle when visibleTo excludes anonymous', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'Agent Chat Anon Hidden',
        menu: { children: [] },
        agentChat: { active: true, visibleTo: ['admin'] }
      }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [{ type: 'title', content: 'Hello', titleSize: 'h2' }] },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    await expect(page.getByText('Hello')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.df-agent-chat-toggle')).toHaveCount(0)
  })
})
