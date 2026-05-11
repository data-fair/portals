import { test as setup, expect } from '@playwright/test'
import { axiosAuth, clean } from './support/axios.ts'

setup('Warmup heavy dev routes', async ({ page, context }) => {
  const dfHost = process.env.DEV_HOST
  const nginxPort = process.env.NGINX_PORT
  const baseUrl = `http://${dfHost}:${nginxPort}`
  const start = Date.now()
  const stamp = (label: string) => console.log(`[warmup] ${label}: ${((Date.now() - start) / 1000).toFixed(1)}s`)

  // Ensure no stale test data lingers from a previous run, then seed a real
  // portal + page so we can exercise the real rendering pipelines (not the
  // 404 error path).
  await clean()
  const admin = await axiosAuth('test_admin@test.com')
  const portal = (await admin.post('/api/portals', {
    config: { title: 'Warmup Portal', menu: { children: [] } }
  })).data
  const createdPage = (await admin.post('/api/pages', {
    type: 'home',
    config: { title: 'Warmup Home', elements: [{ type: 'title', content: 'Warmup', titleSize: 'h2' }] },
    portals: [portal._id],
    owner: portal.owner
  })).data
  stamp('seeded portal + page')

  await context.addCookies([
    { name: 'i18n_lang', value: 'fr', domain: `.${dfHost}`, path: '/' },
    { name: 'cache_bypass', value: '1', domain: `.${dfHost}`, path: '/' }
  ])

  // 1) Warm up the portal Nuxt rendering pipeline on a real portal
  await page.goto(`http://${portal._id}.portals.${dfHost}:${nginxPort}/`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000
  })
  await expect(page.getByText('Warmup')).toBeVisible({ timeout: 60_000 })
  stamp('portal home rendered')

  // 2) Warm up the manager SPA + auth flow by logging in with redirect to the
  //    edit-config of a real page so the VJSF-heavy route fully renders.
  const redirect = `${baseUrl}/portals-manager/pages/${createdPage._id}/edit-config`
  await page.goto(`${baseUrl}/simple-directory/login?redirect=${encodeURIComponent(redirect)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000
  })
  await page.getByLabel('Adresse mail').fill('test_admin@test.com')
  await page.getByLabel('Mot de passe').fill('passwd')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL(redirect, { timeout: 60_000 })
  // Form rendering proves VJSF + page-config schemas finished compiling.
  await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 60_000 })
  stamp('edit-config form rendered')

  // Leave the seeded data — individual tests run clean() in beforeEach.
})
