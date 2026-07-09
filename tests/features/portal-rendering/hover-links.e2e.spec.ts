import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

// Create a home page and publish it through the real draft flow so the API
// generates the server-side markdown (`_html`) that text elements render.
const createHomePage = async (portal: any, elements: any[]) => {
  const config = { title: 'Home', elements }
  const page = (await user1.post('/api/pages', {
    type: 'home',
    config,
    portals: [portal._id],
    owner: portal.owner
  })).data
  await user1.patch(`/api/pages/${page._id}`, { draftConfig: config })
  await user1.post(`/api/pages/${page._id}/draft`)
  return page
}

test.describe('hover effects and links style', () => {
  test.beforeEach(clean)

  test('box element applies configured hover effects', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Hover Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [{
      type: 'card',
      title: 'Ma boite',
      children: [],
      actions: [],
      link: { type: 'external', href: 'https://example.com', title: 'Exemple' },
      hover: { effects: ['elevate', 'titleUnderline'] }
    }])

    await goToPortal(portal._id)
    const card = page.locator('.v-card', { hasText: 'Ma boite' })
    await expect(card).toBeVisible({ timeout: 10_000 })
    const bar = card.locator('[data-pt-hover-underline]')
    await expect(bar).toHaveCSS('transform', 'matrix(0, 0, 0, 1, 0, 0)')
    const shadowBefore = await card.evaluate(el => getComputedStyle(el).boxShadow)
    await expect.poll(async () => {
      await page.mouse.move(0, 0)
      await card.hover()
      return bar.evaluate(el => el.style.transform)
    }, { timeout: 15_000 }).toBe('scaleX(1)')
    await expect(bar).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    await expect.poll(() => card.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe(shadowBefore)
  })

  test('portal hover defaults apply to blocks without override', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Defaults Portal', menu: { children: [] }, defaults: { hover: { effects: ['background'], color: 'secondary' } } }
    })).data
    await createHomePage(portal, [{
      type: 'card',
      title: 'Ma boite',
      children: [],
      actions: [],
      link: { type: 'external', href: 'https://example.com', title: 'Exemple' }
    }])

    await goToPortal(portal._id)
    const card = page.locator('.v-card', { hasText: 'Ma boite' })
    await expect(card).toBeVisible({ timeout: 10_000 })
    const bgBefore = await card.evaluate(el => getComputedStyle(el).backgroundColor)
    await expect.poll(async () => {
      await page.mouse.move(0, 0)
      await card.hover()
      return card.evaluate(el => getComputedStyle(el).backgroundColor)
    }, { timeout: 15_000 }).not.toBe(bgBefore)
  })

  test('unconfigured portal keeps native darken behavior only', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Legacy Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [{
      type: 'card',
      title: 'Ma boite',
      children: [],
      actions: [],
      link: { type: 'external', href: 'https://example.com', title: 'Exemple' }
    }])

    await goToPortal(portal._id)
    const card = page.locator('.v-card', { hasText: 'Ma boite' })
    await expect(card).toBeVisible({ timeout: 10_000 })
    await expect(card).not.toHaveAttribute('style', /--v-hover-opacity/)
    await card.hover()
    await expect(card).toHaveCSS('transform', 'none')
  })

  test('text links are underlined by default', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Links Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [{ type: 'text', content: 'Voir [mon lien](https://example.com/page) pour en savoir plus.' }])

    await goToPortal(portal._id)
    const link = page.locator('a.simple-link', { hasText: 'mon lien' })
    await expect(link).toBeVisible({ timeout: 10_000 })
    await expect(link).toHaveCSS('text-decoration-line', 'underline')
  })

  test('linksConfig underline never disables underline', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'No Underline Portal', menu: { children: [] }, linksConfig: { underline: 'never' } }
    })).data
    await createHomePage(portal, [{ type: 'text', content: 'Voir [mon lien](https://example.com/page) pour en savoir plus.' }])

    await goToPortal(portal._id)
    const link = page.locator('a.simple-link', { hasText: 'mon lien' })
    await expect(link).toBeVisible({ timeout: 10_000 })
    await expect(link).toHaveCSS('text-decoration-line', 'none')
  })

  test('hover-grow links show a growing underline bar', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Grow Links Portal', menu: { children: [] }, linksConfig: { underline: 'hover-grow' } }
    })).data
    await createHomePage(portal, [{ type: 'text', content: 'Voir [mon lien](https://example.com/page) pour en savoir plus.' }])

    await goToPortal(portal._id)
    const link = page.locator('a.simple-link', { hasText: 'mon lien' })
    await expect(link).toBeVisible({ timeout: 10_000 })
    await expect(link).toHaveCSS('text-decoration-line', 'none')
    await expect.poll(async () => {
      await link.hover()
      return link.evaluate(el => getComputedStyle(el, '::after').transform)
    }).toBe('matrix(1, 0, 0, 1, 0, 0)')
  })

  test('title small line grows on link hover', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Title Line Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [{
      type: 'title',
      content: 'Mon titre',
      titleSize: 'h3',
      link: { type: 'external', href: 'https://example.com', title: 'Exemple' },
      line: { position: 'bottom-small', color: 'primary', growOnHover: true }
    }])

    await goToPortal(portal._id)
    const bar = page.locator('[data-pt-title-line]')
    await expect(bar).toBeVisible({ timeout: 10_000 })
    await expect.poll(async () => {
      await page.mouse.move(0, 0)
      await page.locator('a', { hasText: 'Mon titre' }).hover()
      return bar.evaluate(el => el.style.transform)
    }, { timeout: 15_000 }).toBe('scaleX(1.5)')
    await expect(bar).toHaveCSS('transform', 'matrix(1.5, 0, 0, 1, 0, 0)')
  })
})
