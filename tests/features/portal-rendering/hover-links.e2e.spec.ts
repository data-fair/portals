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
      hover: { effects: ['elevate', 'titleUnderlineAnimated', 'border'] }
    }])

    await goToPortal(portal._id)
    const card = page.locator('.v-card', { hasText: 'Ma boite' })
    await expect(card).toBeVisible({ timeout: 10_000 })
    await expect(card).toHaveCSS('border-width', '1px')
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
      return link.evaluate(el => getComputedStyle(el, '::before').transform)
    }).toBe('matrix(1, 0, 0, 1, 0, 0)')
  })

  test('new window icon is shown only on links opening a new tab', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'New Window Icon Portal', menu: { children: [] }, linksConfig: { newWindowIcon: true } }
    })).data
    await createHomePage(portal, [{ type: 'text', content: 'Voir [mon lien](https://example.com/page) pour en savoir plus.' }])

    await goToPortal(portal._id)
    const sameTab = page.locator('a.simple-link', { hasText: 'mon lien' })
    const newTab = page.locator('footer a.simple-link[target="_blank"]', { hasText: 'Koumoul' })
    await expect(sameTab).toBeVisible({ timeout: 10_000 })
    expect(await sameTab.evaluate(el => getComputedStyle(el, '::after').maskImage)).toBe('none')
    expect(await newTab.evaluate(el => getComputedStyle(el, '::after').maskImage)).toContain('data:image/svg+xml')
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
    await expect.poll(() => bar.evaluate(el => el.style.width)).toBe('80px')
    await expect.poll(async () => {
      await page.mouse.move(0, 0)
      await page.locator('a', { hasText: 'Mon titre' }).hover()
      return bar.evaluate(el => el.style.width)
    }, { timeout: 15_000 }).toBe('100%')
  })

  test('underline title line decorates every wrapped line, bottom-medium keeps its separate line', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Title Underline Portal', menu: { children: [] } }
    })).data
    const content = 'Un titre assez long pour passer sur plusieurs lignes quelle que soit la largeur de la fenêtre du navigateur'
    await createHomePage(portal, [
      { type: 'title', content, titleSize: 'h3', titleTag: 'h2', line: { position: 'underline', color: 'primary' } },
      { type: 'title', content: 'Titre au trait moyen', titleSize: 'h3', titleTag: 'h2', line: { position: 'bottom-medium', color: 'primary' } }
    ])

    await goToPortal(portal._id)
    const underlined = page.getByRole('heading', { name: content })
    await expect(underlined).toBeVisible({ timeout: 10_000 })
    const text = underlined.locator('span', { hasText: content }).last()
    await expect(text).toHaveCSS('text-decoration-line', 'underline')
    await expect(underlined.locator('[data-pt-title-line]')).toHaveCount(0)
    // the decoration is per line, which only matters if the title really wraps
    const lines = await text.evaluate(el => {
      const range = document.createRange()
      range.selectNodeContents(el)
      return range.getClientRects().length
    })
    expect(lines).toBeGreaterThan(1)

    const medium = page.getByRole('heading', { name: 'Titre au trait moyen' })
    await expect(medium.locator('[data-pt-title-line]')).toHaveCount(1)
    await expect(medium.locator('span', { hasText: 'Titre au trait moyen' }).last()).toHaveCSS('text-decoration-line', 'none')
  })

  test('box background image zooms on hover inside the box', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Background Zoom Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [{
      type: 'card',
      title: 'Ma boite',
      children: [{ type: 'text', content: 'Voir [mon lien](https://example.com/page) dans la boite.' }],
      actions: [],
      link: { type: 'external', href: 'https://example.com', title: 'Exemple' },
      hover: { effects: ['imageZoom'] },
      background: { image: { _id: 'bg-1', name: 'bg.png', mimeType: 'image/png' }, color: 'primary', tintStrength: 0.3 }
    }])

    await goToPortal(portal._id)
    const card = page.locator('.v-card', { hasText: 'Ma boite' })
    await expect(card).toBeVisible({ timeout: 10_000 })
    // the image moved from the box to a decorative layer, hidden from assistive technologies
    const layer = card.locator(':scope > [aria-hidden="true"]').first()
    await expect(layer).toHaveCSS('background-image', /linear-gradient.*bg-1/)
    await expect(card).toHaveCSS('background-image', 'none')

    // the layer stays under the box link and the inner links
    const hits = await card.evaluate(el => {
      const r = el.getBoundingClientRect()
      const center = document.elementFromPoint(r.left + r.width / 2, r.top + 20)
      const innerLink = el.querySelector('a.simple-link')!.getBoundingClientRect()
      const inner = document.elementFromPoint(innerLink.left + innerLink.width / 2, innerLink.top + innerLink.height / 2)
      return { box: center?.classList.contains('card-overlay-link'), inner: inner?.closest('a')?.textContent }
    })
    expect(hits).toEqual({ box: true, inner: 'mon lien' })

    await expect.poll(async () => {
      await page.mouse.move(0, 0)
      await card.hover()
      return layer.evaluate(el => el.style.transform)
    }, { timeout: 15_000 }).toBe('scale(1.05)')
    await expect(card).toHaveCSS('transform', 'none')
  })
})
