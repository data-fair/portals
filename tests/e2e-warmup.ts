import { test as setup, expect, portalUrl } from './fixtures/portal.ts'
import { axiosAuth, clean } from './support/axios.ts'

/**
 * The first hit of the portal makes nuxt build its SSR bundle, and the first hit of each heavy
 * manager route makes vite transform its modules (vjsf compiled forms): tens of seconds on a
 * cold cache. This project runs before the e2e ones and visits them once, with long timeouts,
 * then reloads the manager to prove nothing is left to transform. Each step's duration is
 * recorded in the test annotations.
 */
setup('warm up the portal and the heavy manager routes', async ({ page, goToWithAuth }, testInfo) => {
  let last = Date.now()
  const stamp = (step: string) => {
    testInfo.annotations.push({ type: 'warmup', description: `${step}: ${Date.now() - last} ms` })
    last = Date.now()
  }

  // a real portal and page, so the real rendering pipelines run (not the 404 error path)
  await clean()
  const admin = await axiosAuth('test_admin@test.com')
  const portal = (await admin.post('/api/portals', {
    // the agent chat loads its own modules after hydration, the first visit would reload the page under a test
    config: { title: 'Warmup Portal', menu: { children: [] }, agentChat: { active: true } }
  })).data
  const createdPage = (await admin.post('/api/pages', {
    type: 'home',
    config: { title: 'Warmup Home', elements: [{ type: 'title', content: 'Warmup', titleSize: 'h2' }] },
    portals: [portal._id],
    owner: portal.owner
  })).data
  stamp('seed a portal and a page')

  await page.goto(portalUrl(portal._id) + '/', { waitUntil: 'domcontentloaded' })
  // exact: the portal title "Warmup Portal" is rendered in the header too
  await expect(page.getByText('Warmup', { exact: true })).toBeVisible()
  await expect(page.locator('.df-agent-chat-toggle')).toBeVisible()
  stamp('portal home')

  await goToWithAuth(`/portals-manager/pages/${createdPage._id}/edit-config`, 'test_admin')
  // the form proves vjsf and the page-config schemas finished compiling
  await expect(page.getByLabel('Titre')).toBeVisible()
  stamp('page editor')

  await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
  await expect(page.getByRole('tab', { name: 'Apparence' })).toBeVisible()
  stamp('portal editor')

  await page.reload()
  await expect(page.getByRole('tab', { name: 'Apparence' })).toBeVisible({ timeout: 10_000 })
  stamp('reload stable')

  await clean()
})
