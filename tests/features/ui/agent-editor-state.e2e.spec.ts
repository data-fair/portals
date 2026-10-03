import type { Page } from '@playwright/test'
import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

/**
 * Read the host state the editors publish to the agent chat, the way the chat does:
 * ask every publisher on the tab channel to resend, and keep the last value per key.
 */
const readAgentState = async (page: Page) => {
  return await page.evaluate(async () => {
    const channelId = sessionStorage.getItem('mcpTabChannelId')
    if (!channelId) return {}
    const ch = new BroadcastChannel(channelId)
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
}

// Judged simulations: the assistant only knew the route, so it invented buttons,
// never learned that edits are drafts, and never found where the menu is edited.
test.describe('agent host state of the editors', () => {
  test.beforeEach(clean)

  test('the page editor publishes its guidance and the draft state', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'State Portal', menu: { children: [] } } })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: { title: 'State Page', elements: [], genericMetadata: { slug: 'state-page' } },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToWithAuth(`/portals-manager/pages/${createdPage._id}/edit-config`, 'test_admin')
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 30_000 })

    await expect.poll(async () => (await readAgentState(page)).editor ?? '').toContain('pageConfig_form')
    // the assistant action was labelled in English in the French editor
    await expect(page.locator('[data-action-id="configure-page"]')).toHaveAttribute('title', "Demander à l'assistant")
    // the store settles once the editor has loaded the page
    await expect.poll(async () => (await readAgentState(page)).draft ?? '').toContain('no unpublished changes')

    // the page is attached to the portal: it says so, by the portal's title
    await expect.poll(async () => (await readAgentState(page)).publication ?? '').toBe('published on: State Portal')

    await page.getByLabel('Titre').fill('State Page renamed')
    await page.getByLabel('Titre').blur()
    await expect.poll(async () => (await readAgentState(page)).draft ?? '').toContain('the person must press « Valider le brouillon »')
  })

  test('the page view reports publishing the page on a portal', async ({ page, goToWithAuth }) => {
    // a judged run had the person tick « Publié » with nothing telling the assistant
    const portal = (await user1.post('/api/portals', { config: { title: 'Publication Portal', menu: { children: [] } } })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: { title: 'Publication Page', elements: [{ type: 'text', content: 'Hello' }], genericMetadata: { slug: 'publication-page' } },
      portals: [],
      owner: portal.owner
    })).data
    await goToWithAuth(`/portals-manager/pages/${createdPage._id}?tab=publications`, 'test_admin')
    await expect.poll(async () => (await readAgentState(page)).publication ?? '', { timeout: 30_000 }).toContain('published on no portal')
    await page.getByRole('checkbox', { name: 'Publié' }).first().check()
    await expect.poll(async () => (await readAgentState(page)).publication ?? '').toBe('published on: Publication Portal')
  })

  test('the pages list points to the creation wizard', async ({ page, goToWithAuth }) => {
    await goToWithAuth('/portals-manager/pages', 'test_admin')
    await expect.poll(async () => (await readAgentState(page)).pages ?? '', { timeout: 30_000 }).toContain('« Créer une nouvelle page »')
  })

  test('the page creation wizard publishes its guidance and current step', async ({ page, goToWithAuth }) => {
    await goToWithAuth('/portals-manager/pages/new', 'test_admin')
    await expect.poll(async () => (await readAgentState(page)).wizard ?? '', { timeout: 30_000 }).toContain('not the portal menu')
    expect((await readAgentState(page))['wizard-step']).toContain('« Type de page »')
  })

  test('the portal editor publishes its guidance', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'State Portal 2', menu: { children: [] } } })).data
    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    await expect.poll(async () => (await readAgentState(page)).editor ?? '', { timeout: 30_000 }).toContain('portalConfig_form')
    // opening the editor of a new portal fills schema defaults into the form: not a draft
    await page.waitForTimeout(3000)
    await expect.poll(async () => (await readAgentState(page)).draft ?? '').toContain('no unpublished changes')
  })
})
