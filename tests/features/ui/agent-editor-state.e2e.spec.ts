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
    await expect.poll(async () => (await readAgentState(page)).publication ?? '').toContain('published on: State Portal (its editor')

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
    await expect.poll(async () => (await readAgentState(page)).publication ?? '').toContain('published on: Publication Portal (its editor')
  })

  test('the pages list points to the creation wizard', async ({ page, goToWithAuth }) => {
    await goToWithAuth('/portals-manager/pages', 'test_admin')
    await expect.poll(async () => (await readAgentState(page)).pages ?? '', { timeout: 30_000 }).toContain('« Créer une nouvelle page »')
  })

  test('the page editor reports a draft save the API refused', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Save Portal', menu: { children: [] } } })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: { title: 'Save Page', elements: [], genericMetadata: { slug: 'save-page' } },
      portals: [portal._id],
      owner: portal.owner
    })).data
    await page.route(`**/api/pages/${createdPage._id}`, route => route.request().method() === 'PATCH'
      ? route.fulfill({ status: 400, contentType: 'text/plain', body: 'body/draftConfig/elements/1 requiert la propriété type' })
      : route.continue())
    await goToWithAuth(`/portals-manager/pages/${createdPage._id}/edit-config`, 'test_admin')
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 30_000 })
    await page.getByLabel('Titre').fill('Save Page renamed')
    await page.getByLabel('Titre').blur()
    await expect.poll(async () => (await readAgentState(page))['draft-save'] ?? '').toContain('NOT saved')
  })

  test('the page creation wizard publishes its guidance and current step', async ({ page, goToWithAuth }) => {
    await goToWithAuth('/portals-manager/pages/new', 'test_admin')
    await expect.poll(async () => (await readAgentState(page)).wizard ?? '', { timeout: 30_000 }).toContain('not the portal menu')
    expect((await readAgentState(page))['wizard-step']).toContain('« Type de page »')
  })

  test('the portal editor reports an incomplete form, whose change is not saved', async ({ page, goToWithAuth }) => {
    // a run lost a half-configured menu item when the person left the editor: nothing had
    // told the assistant that the incomplete row was not saved
    const portal = (await user1.post('/api/portals', { config: { title: 'Form Portal', menu: { children: [{ type: 'standard', subtype: 'home' }] } } })).data
    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    await expect.poll(async () => (await readAgentState(page)).editor ?? '', { timeout: 30_000 }).toContain('portalConfig_form')
    await expect.poll(async () => (await readAgentState(page)).form, { timeout: 15_000 }).toBeUndefined()
    await page.getByRole('tab', { name: 'Barre de navigation' }).click()
    await page.getByRole('button', { name: 'Ajouter un lien' }).click()
    await expect.poll(async () => (await readAgentState(page)).form ?? '').toContain('NOT saved')
    // the field wraps its input and takes the click
    await page.locator('.v-field', { has: page.getByRole('combobox', { name: 'Type de lien' }) }).click()
    await page.getByRole('option', { name: 'Page standard (Accueil, Contact,...)' }).click()
    // a standard page item has no page type until one is chosen: a default « Accueil » made the
    // row complete at once, and a judged run nearly published a duplicate home link
    await page.waitForTimeout(1000)
    expect((await readAgentState(page)).form ?? '').toContain('NOT saved')
    await page.locator('.v-field', { has: page.getByRole('combobox', { name: 'Type de page' }) }).click()
    await page.getByRole('option', { name: 'Catalogue de données' }).click()
    await expect.poll(async () => (await readAgentState(page)).form ?? '').toContain('complete again')
  })

  test('the portal editor says the draft is published as soon as it is validated', async ({ page, goToWithAuth }) => {
    // a judged run's wait for the validation returned « draft-validated » with the older
    // « unpublished changes » state still current: the draft state only changed once the
    // portal was reloaded, after the wait had answered
    const portal = (await user1.post('/api/portals', { config: { title: 'Validate Portal', menu: { children: [] } } })).data
    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    const title = page.getByLabel('Titre', { exact: true })
    await expect(title).toBeVisible({ timeout: 30_000 })
    const saved = page.waitForResponse(response => response.url().includes(`/api/portals/${portal._id}`) && response.request().method() === 'PATCH' && response.ok())
    await title.fill('Validate Portal renamed')
    await title.blur()
    await saved
    await expect.poll(async () => (await readAgentState(page)).draft ?? '').toContain('unpublished changes: the person must press')
    // the reload that follows the validation is slow: the state must not wait for it
    await page.route(`**/api/portals/${portal._id}`, async route => {
      if (route.request().method() === 'GET') await new Promise(resolve => setTimeout(resolve, 3000))
      await route.continue()
    })
    await page.evaluate(() => {
      const channelId = sessionStorage.getItem('mcpTabChannelId')
      const ch = new BroadcastChannel(channelId!)
      const seen: Array<{ name: string, detail?: string, t: number }> = (window as any).__agentEvents = []
      ch.onmessage = (e) => { if (e.data?.type === 'agent-event') seen.push({ name: e.data.event.name, detail: e.data.event.detail, t: Date.now() }) }
    })
    await page.getByRole('button', { name: 'Valider le brouillon' }).click()
    await expect.poll(() => page.evaluate(() => (window as any).__agentEvents.some((e: any) => e.name === 'draft-validated'))).toBe(true)
    const events = await page.evaluate(async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return (window as any).__agentEvents
    })
    const validated = events.find((e: any) => e.name === 'draft-validated')
    const published = events.find((e: any) => e.name === 'draft' && e.detail?.includes('no unpublished changes'))
    expect(published, JSON.stringify(events)).toBeTruthy()
    expect(published.t - validated.t).toBeLessThan(300)
  })

  test('the portal editor publishes its guidance', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'State Portal 2', menu: { children: [] } } })).data
    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    await expect.poll(async () => (await readAgentState(page)).editor ?? '', { timeout: 30_000 }).toContain('portalConfig_form')
    // the options of a menu row, so that the assistant does not ask the person to read them out
    expect((await readAgentState(page))['editor-menu-options']).toContain("« Catalogue d'événements »")
    // opening the editor of a new portal fills schema defaults into the form: not a draft
    await page.waitForTimeout(3000)
    await expect.poll(async () => (await readAgentState(page)).draft ?? '').toContain('no unpublished changes')
  })
})
