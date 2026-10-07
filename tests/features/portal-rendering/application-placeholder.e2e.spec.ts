// Nothing is rendered server-side inside the <ClientOnly> of an application block, so the
// content below it used to jump down on hydration, once <d-frame> gave itself a height.
// The wrapper now reserves that height in the server html, as the fallback of <ClientOnly>.
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

// No application is seeded in data-fair: the iframe lands on a 404, which does not matter
// since the placeholder only lives until <d-frame> mounts.
const application = { id: 'no-such-app', slug: 'no-such-app', title: 'Missing app' }

const seedPortal = async () => {
  const portal = (await user1.post('/api/portals', {
    config: { title: 'App Placeholder Portal', menu: { children: [] } }
  })).data
  await user1.post('/api/pages', {
    type: 'home',
    config: {
      title: 'Home',
      elements: [
        { uuid: 'app-auto', type: 'application', application },
        { uuid: 'app-ratio', type: 'application', application, displayMode: 'aspect-ratio', ratio: '16/9' },
        { uuid: 'app-fixed', type: 'application', application, displayMode: 'fixed-height', height: 300 },
        { uuid: 'marker', type: 'title', content: 'Below the applications', titleSize: 'h2' }
      ]
    },
    portals: [portal._id],
    owner: portal.owner
  })
  return portal
}

test.describe('application block placeholder', () => {
  test.beforeEach(clean)

  test('the server html reserves the height d-frame will take', async ({ request }) => {
    const portal = await seedPortal()
    const res = await request.get(
      `http://${portal._id}.portals.${process.env.DEV_HOST}:${process.env.NGINX_PORT}/`,
      { headers: { 'accept-language': 'fr' }, timeout: 20_000 }
    )
    expect(res.status()).toBe(200)
    const html = await res.text()
    // auto mode mirrors the width-based ratio of d-frame through container queries
    expect(html).toContain('frame-placeholder')
    expect(html).toMatch(/aspect-ratio:\s*1\.77/)
    expect(html).toMatch(/min-height:\s*300px/)
  })

  test('the content below does not move when d-frame mounts', async ({ page, goToPortal }) => {
    const portal = await seedPortal()

    await page.addInitScript(() => {
      const shifts: { text: string, dy: number }[] = []
      ;(window as any).__shifts = shifts
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (entry.hadRecentInput) continue
          for (const source of entry.sources) {
            shifts.push({ text: source.node?.textContent?.trim().slice(0, 40) ?? '', dy: source.currentRect.y - source.previousRect.y })
          }
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })

    await goToPortal(portal._id)
    const frames = page.locator('d-frame')
    await expect(frames).toHaveCount(3, { timeout: 15_000 })
    // the placeholders leave with the fallback
    await expect(page.locator('.frame-placeholder')).toHaveCount(0, { timeout: 15_000 })

    const markerMoves = await page.evaluate(() =>
      (window as any).__shifts.filter((s: { text: string }) => s.text.startsWith('Below the applications')).map((s: { dy: number }) => Math.abs(s.dy))
    )
    expect(Math.max(0, ...markerMoves)).toBeLessThanOrEqual(1)
  })
})
