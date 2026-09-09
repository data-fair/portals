// The other card specs stub the list so they can control every source, which only
// exercises the client-rendered path. This one seeds a real dataset in data-fair and
// goes through the true server-rendered pipeline, to prove that the first candidate
// really is in the server html and that the cascade takes over after hydration.
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'
import { deleteDatasets, seedDataset } from '../../support/data-fair.ts'
import { imageRef, stubImage, thumbnailSrc } from '../../support/cards.ts'

const user1 = await axiosAuth('test_admin@test.com')
const seeded: string[] = []

test.describe('card thumbnail on the server-rendered path', () => {
  test.beforeEach(clean)
  test.afterAll(async () => { await deleteDatasets(seeded) })

  test('the first candidate is server-rendered and the cascade takes over on the client', async ({ page, goToPortal, request }) => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'SSR Card Portal',
        menu: { children: [] },
        datasets: {
          card: {
            titleLinesCount: 1,
            showSummary: true,
            thumbnail: { show: true, location: 'center', crop: true, default: imageRef('default-1') }
          }
        }
      }
    })).data
    await user1.post('/api/pages', {
      type: 'datasets',
      config: { title: 'Catalogue', elements: [{ uuid: 'cat1', type: 'datasets-catalog', columns: 2, filters: { items: ['search'] } }] },
      portals: [portal._id],
      owner: portal.owner
    })

    const id = `test-ssr-card-${Date.now()}`
    seeded.push(await seedDataset(portal._id, {
      id,
      title: 'Jeu SSR',
      summary: 'Resume SSR',
      image: 'https://images.test/ssr-broken.png'
    }))

    // the server html already carries the card and its first candidate
    const res = await request.get(
      `http://${portal._id}.portals.${process.env.DEV_HOST}:${process.env.NGINX_PORT}/datasets`,
      { headers: { 'accept-language': 'fr' }, timeout: 20_000 }
    )
    expect(res.status()).toBe(200)
    const html = await res.text()
    expect(html).toContain('Jeu SSR')
    // the nuxt payload escapes slashes
    expect(html.replace(/\\u002F/g, '/')).toContain('https://images.test/ssr-broken.png')

    // in the browser that first candidate fails and the default image takes over
    await stubImage(page, '**/images.test/**', 'notFound')
    await stubImage(page, '**/portal/api/images/**', 'ok')

    await goToPortal(portal._id, '/datasets')
    const card = page.locator('.v-card').filter({ hasText: 'Jeu SSR' }).first()
    await expect(card).toBeVisible({ timeout: 20_000 })
    await expect.poll(() => thumbnailSrc(card), { timeout: 20_000 }).toContain('/portal/api/images/default-1')
  })
})
