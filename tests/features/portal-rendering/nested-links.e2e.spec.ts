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
})
