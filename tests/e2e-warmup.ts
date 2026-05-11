import { test as setup } from '@playwright/test'

const dummyId = 'ffffffffffffffffffffffff'

setup('Warmup heavy dev routes', async ({ page, context }) => {
  const baseUrl = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
  await context.addCookies([
    { name: 'i18n_lang', value: 'fr', domain: `.${process.env.DEV_HOST}`, path: '/' },
    { name: 'cache_bypass', value: '1', domain: `.${process.env.DEV_HOST}`, path: '/' }
  ])

  // Warm up portal Nuxt shell (compiles the portal app for SSR + client)
  try {
    await page.goto(`http://${dummyId}.portals.${process.env.DEV_HOST}:${process.env.NGINX_PORT}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    })
  } catch {
    // a 404 portal is fine — Vite still compiled the route
  }

  // Warm up manager SPA + auth flow + edit-config (the heaviest Vite route)
  // We log in and navigate to a fake page id so Vite compiles the lazy
  // edit-config chunk before any test needs it.
  const redirect = `${baseUrl}/portals-manager/pages/${dummyId}/edit-config`
  await page.goto(`${baseUrl}/simple-directory/login?redirect=${encodeURIComponent(redirect)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000
  })
  await page.getByLabel('Adresse mail').fill('test_admin@test.com')
  await page.getByLabel('Mot de passe').fill('passwd')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  // Wait until the SPA has actually mounted the edit-config route (Vite compiled)
  try {
    await page.waitForURL(redirect, { timeout: 60_000 })
    await page.waitForLoadState('networkidle', { timeout: 60_000 })
  } catch {
    // even on partial completion, the bulk of Vite compilation has happened
  }
})
