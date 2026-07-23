import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

const baseHost = `${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
const portalUrl = (portalId: string) => `http://${portalId}.portals.${baseHost}`

const createHomePage = async (portal: any, elements: any[]) => {
  const config = { title: 'Home', elements }
  const page = (await user1.post('/api/pages', { type: 'home', config, portals: [portal._id], owner: portal.owner })).data
  await user1.patch(`/api/pages/${page._id}`, { draftConfig: config })
  await user1.post(`/api/pages/${page._id}/draft`)
  return page
}

// A clickable box whose content also holds links is a configuration the editor allows
// and the portal cannot prevent. As long as the box is itself an <a>, those inner links
// are anchors inside an anchor: the parser then hoists the box content out of the anchor
// and clones it, and the box renders twice. The card link is an overlay instead, so
// inner links are siblings of it and the markup stays valid.
const boxWithLinksInside = {
  type: 'card',
  title: 'Boite cliquable',
  link: { type: 'external', href: 'https://example.com', title: 'Exemple' },
  actions: [{ type: 'external', href: 'https://example.com/action', title: 'En savoir plus' }],
  children: [
    { type: 'text', content: 'Voir [mon lien](https://example.com/page) pour en savoir plus.' },
    { type: 'title', content: 'Titre lie', titleSize: 'h4', link: { type: 'external', href: 'https://example.com/titre' } }
  ]
}

// Nested anchors cannot be observed on the parsed DOM: the parser silently repairs
// them. It repairs them by *cloning* the outer anchor around every chunk it hoists
// out, so counting anchors before and after parsing exposes the damage.
const anchorsInSource = (html: string) => (html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .match(/<a[\s>]/g) || []).length

test.describe('nested links', () => {
  test.beforeEach(clean)

  test('a clickable box holding links emits no anchor inside an anchor', async ({ request, page }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Nested Links Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [boxWithLinksInside])

    const res = await request.get(portalUrl(portal._id), { headers: { 'accept-language': 'fr' }, timeout: 20_000 })
    expect(res.status()).toBe(200)
    const html = await res.text()

    // the inner links must really be there, otherwise the assertion below proves nothing
    expect(html).toContain('https://example.com/action')
    expect(html).toContain('https://example.com/page')
    expect(html).toContain('https://example.com/titre')
    const parsedAnchors = await page.evaluate(
      (raw) => new DOMParser().parseFromString(raw, 'text/html').querySelectorAll('a').length,
      html
    )
    expect(parsedAnchors).toBe(anchorsInSource(html))
  })

  test('the box renders once and its inner links keep their own destination', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Nested Links Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [boxWithLinksInside])

    await goToPortal(portal._id)
    await expect(page.getByRole('link', { name: 'En savoir plus' })).toBeVisible({ timeout: 10_000 })

    // the parser clones the box anchor around each chunk it hoists out of it
    await expect(page.locator('.v-card', { hasText: 'Boite cliquable' })).toHaveCount(1)
    await expect(page.locator('.v-card-title', { hasText: 'Boite cliquable' })).toHaveCount(1)

    await expect(page.getByRole('link', { name: 'En savoir plus' })).toHaveAttribute('href', 'https://example.com/action')
    await expect(page.locator('a.simple-link', { hasText: 'mon lien' })).toHaveAttribute('href', 'https://example.com/page')
    // the box link itself covers the card and points at its own destination
    await expect(page.getByRole('link', { name: 'Exemple' })).toHaveAttribute('href', 'https://example.com')
  })

  test('the box keeps the native ripple even though it is no longer an anchor', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Nested Links Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [boxWithLinksInside])

    await goToPortal(portal._id)
    const card = page.locator('.v-card', { hasText: 'Boite cliquable' })
    await expect(card).toBeVisible({ timeout: 10_000 })
    // the card renders as a div, `link` alone is what keeps it clickable
    expect(await card.evaluate(el => el.tagName)).toBe('DIV')
    await expect(card).toHaveClass(/v-card--link/)

    // the ripple directive is only attached once hydrated
    await expect.poll(
      () => card.evaluate((el: any) => !!el._ripple?.enabled),
      { timeout: 15_000 }
    ).toBe(true)

    const box = (await card.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + 30)
    await page.mouse.down()
    await expect(card.locator('.v-ripple__animation')).toHaveCount(1)
    await page.mouse.up()
  })

  test('the actions strip escapes the box link, the rest of the box does not', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Nested Links Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [boxWithLinksInside])

    await goToPortal(portal._id)
    const card = page.locator('.v-card', { hasText: 'Boite cliquable' })
    await expect(card).toBeVisible({ timeout: 10_000 })

    // what a click lands on, at the centre of each zone
    const hit = async (selector: string) => {
      const box = (await page.locator(selector).boundingBox())!
      return page.evaluate(([x, y]) => {
        const el = document.elementFromPoint(x as number, y as number)
        const link = el?.closest('a')
        return link ? link.getAttribute('href') : null
      }, [box.x + box.width / 2, box.y + box.height / 2])
    }

    // box body => the card link
    expect(await hit('.v-card-title')).toBe('https://example.com')
    // action button => its own destination
    expect(await hit('.v-card-actions a')).toBe('https://example.com/action')
    // actions strip outside a button => no link at all
    const strip = (await card.locator('.v-card-actions').boundingBox())!
    const dead = await page.evaluate(([x, y]) => {
      const el = document.elementFromPoint(x as number, y as number)
      return el?.closest('a')?.getAttribute('href') ?? null
    }, [strip.x + strip.width - 8, strip.y + strip.height / 2])
    expect(dead).toBeNull()
  })
})
