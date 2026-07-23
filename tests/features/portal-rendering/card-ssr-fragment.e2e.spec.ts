import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

const baseHost = `${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
const portalUrl = (portalId: string) => `http://${portalId}.portals.${baseHost}`

const publishPage = async (portal: any, type: string, config: any) => {
  const page = (await user1.post('/api/pages', { type, title: config.title, config, portals: [portal._id], owner: portal.owner })).data
  await user1.patch(`/api/pages/${page._id}`, { draftConfig: config })
  await user1.post(`/api/pages/${page._id}/draft`)
  return page
}

// Catalog cards are anchors holding anchors (action buttons, topic chips), which the
// HTML parser cannot keep: it hoists the card content out of the anchor and clones it.
// Vue drops those leftovers in hydrateElement, but not in hydrateFragment — so as soon
// as a fragment sits between the grid column and the card, the damage survives
// hydration and the card renders twice. Keep cards direct children of their column.
test.describe('card SSR markup', () => {
  test.beforeEach(clean)

  test('a grid card is a direct child of its column, with no fragment anchor', async ({ request }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Card SSR Portal', menu: { children: [] } }
    })).data
    await publishPage(portal, 'news', {
      title: 'Actu de test',
      newsMetadata: { slug: 'actu-de-test', date: new Date('2026-07-01').toISOString() },
      elements: []
    })
    await publishPage(portal, 'home', {
      title: 'Home',
      elements: [{ type: 'news-list', mode: 'upcoming', limit: 3, columns: 3, usePortalConfig: true }]
    })

    const res = await request.get(portalUrl(portal._id), { headers: { 'accept-language': 'fr' }, timeout: 20_000 })
    expect(res.status()).toBe(200)
    const html = await res.text()

    expect(html).toContain('Actu de test')
    // <div class="v-col ..."><a ... class="v-card ..."> — no <!--[--> in between
    expect(html).toMatch(/<div class="v-col[^"]*"[^>]*><a [^>]*class="v-card/)
    expect(html).not.toMatch(/<div class="v-col[^"]*"[^>]*><!--\[--><a [^>]*class="v-card/)
  })
})
