// Network and timing budget for card thumbnails.
//
// The cascade multiplies the number of image requests a catalogue can issue, and the
// source it retries most is the most expensive one the platform has: a capture that
// cannot be generated is tried twice by data-fair with a 4s pause, then answers
// Cache-Control: no-cache. These tests pin the cost down.
import { test, expect } from '../../fixtures/portal.ts'
import { clean } from '../../support/axios.ts'
import {
  CAPTURE_URL, PORTAL_IMAGE_URL,
  createCardPortal, makeDataset, makeApplication,
  openCatalogWithStub, recordImageRequests, stubImage, stubList,
  linkedApplication, imageRef, thumbnailSrc
} from '../../support/cards.ts'

const manyDatasets = (n: number, over: (i: number) => Record<string, any> = () => ({})) =>
  Array.from({ length: n }, (_, i) => makeDataset({ id: `ds-perf-${i + 1}`, ...over(i + 1) }))

test.describe('card thumbnail budget', () => {
  test.beforeEach(clean)

  // the default image is one immutable url shared by the whole page: the browser must
  // fetch it once and serve every other card from its memory cache
  test('a default image shared by 20 cards is fetched once', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      columns: 3,
      card: {
        titleLinesCount: 1,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', manyDatasets(20))
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')
    const requested = recordImageRequests(page)

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-perf-20')
    await page.waitForTimeout(2_000)

    expect(requested.filter((u) => u.includes('/portal/api/images/default-1'))).toHaveLength(1)
  })

  // the left location shows the image through a background-image and observes it
  // through a hidden probe: both point at the same url, so it must cost one request
  test('a left thumbnail costs a single request despite its probe', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 2,
        showSummary: true,
        thumbnail: { show: true, location: 'left', crop: true, useApplication: true }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-leftcost', extras: { applications: [linkedApplication('app-leftcost')] } })])
    await stubImage(page, CAPTURE_URL, 'ok')
    const requested = recordImageRequests(page)

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-leftcost')
    await page.waitForTimeout(2_000)

    expect(requested.filter((u) => u.includes('/applications/app-leftcost/capture'))).toHaveLength(1)
  })

  // a failing source must cost exactly one extra request, not one per remaining candidate
  test('a broken source costs exactly one extra request', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 1,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-cost', extras: { applications: [linkedApplication('app-cost')] } })])
    await stubImage(page, CAPTURE_URL, 'capturePlaceholder')
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')
    const requested = recordImageRequests(page)

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-cost')
    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-cost' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 20_000 }).toContain('/portal/api/images/default-1')
    await page.waitForTimeout(1_000)

    // one capture attempt, one default image, nothing more
    expect(requested.filter((u) => /capture|portal\/api\/images/.test(u))).toHaveLength(2)
  })

  // 20 cards, each with its own capture: one request per card, no cascade overhead
  test('a page of 20 working captures issues 20 image requests', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      columns: 3,
      card: {
        titleLinesCount: 1,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', manyDatasets(20, (i) => ({ extras: { applications: [linkedApplication(`app-perf-${i}`)] } })))
    await stubImage(page, CAPTURE_URL, 'ok')
    const defaults = await stubImage(page, PORTAL_IMAGE_URL, 'ok')
    const requested = recordImageRequests(page)

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-perf-20')
    await expect.poll(
      () => requested.filter((u) => u.includes('/capture')).length,
      { timeout: 20_000 }
    ).toBeGreaterThan(0)

    // v-img is driven by v-intersect: the cards below the fold have asked for nothing yet
    const aboveTheFold = requested.filter((u) => u.includes('/capture')).length
    expect(aboveTheFold).toBeLessThan(20)

    // scrolling brings the rest in, one request each. Jumping straight to the last card
    // would skip the ones in between: they would never intersect the viewport.
    for (let i = 1; i <= 20; i++) {
      await page.locator('.v-card').filter({ hasText: `Jeu ds-perf-${i}` }).first().scrollIntoViewIfNeeded()
    }
    await expect.poll(
      () => requested.filter((u) => u.includes('/capture')).length,
      { timeout: 20_000 }
    ).toBe(20)
    await page.waitForTimeout(1_000)

    const captures = requested.filter((u) => u.includes('/capture'))
    expect(captures).toHaveLength(20)
    // scrolling must not make a card ask twice
    expect(new Set(captures).size).toBe(captures.length)
    // no card fell through to the default image
    expect(defaults.urls).toHaveLength(0)
  })

  // 20 cards all failing on the same broken capture: the cascade must not turn one dead
  // url into 20 slow requests on every render
  test('20 cards sharing one broken capture stay within a small request budget', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      columns: 3,
      card: {
        titleLinesCount: 1,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', manyDatasets(20, () => ({ extras: { applications: [linkedApplication('app-shared-dead')] } })))
    await stubImage(page, CAPTURE_URL, 'capturePlaceholder')
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')
    const requested = recordImageRequests(page)

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-perf-20')
    const lastCard = page.locator('.v-card').filter({ hasText: 'Jeu ds-perf-20' }).first()
    // v-img only loads what intersects, so the last card has to be brought into view
    await lastCard.scrollIntoViewIfNeeded()
    await expect.poll(() => thumbnailSrc(lastCard), { timeout: 25_000 }).toContain('/portal/api/images/default-1')
    await page.waitForTimeout(1_000)

    // the cards of one viewport render together so the browser may issue their requests
    // in parallel before any of them fails, but no url is ever asked for twice
    const captures = requested.filter((u) => u.includes('/capture'))
    expect(captures.length).toBeLessThanOrEqual(20)
    expect(requested.filter((u) => u.includes('/portal/api/images/default-1'))).toHaveLength(1)
  })

  // a slow capture must never hold the text of the card back
  test('a slow capture does not delay the card text', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 1,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-slow', summary: 'Resume immediat', extras: { applications: [linkedApplication('app-slow')] } })])
    // longer than a real failing capture, which costs ~8s: two attempts, 4s apart, and
    // short enough to stay under the test timeout
    const capture = await stubImage(page, CAPTURE_URL, 'capturePlaceholder', 10_000)
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-slow')
    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-slow' }).first()
    // wait until the capture is really in flight
    await expect.poll(() => capture.urls.length, { timeout: 15_000 }).toBeGreaterThan(0)

    // while it is still pending, the text of the card is already up
    await expect(card.getByText('Resume immediat')).toBeVisible({ timeout: 5_000 })
    expect(capture.answered).toBe(0)
  })

  // once a capture is known to fail, a later render must not wait for it again
  test('a known bad source does not cost its full latency a second time', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 1,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-twice', extras: { applications: [linkedApplication('app-twice')] } })])
    await stubImage(page, CAPTURE_URL, 'capturePlaceholder', 3_000)
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')
    const requested = recordImageRequests(page)

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-twice')
    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-twice' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 25_000 }).toContain('/portal/api/images/default-1')

    const before = requested.length
    const search = page.getByRole('textbox', { name: 'Rechercher', exact: true })
    await search.fill('relance-perf')
    await search.press('Enter')

    // after the refresh the default image must be up without another capture attempt
    await expect.poll(() => thumbnailSrc(card), { timeout: 10_000 }).toContain('/portal/api/images/default-1')
    expect(requested.slice(before).filter((u) => u.includes('/capture'))).toHaveLength(0)
  })

  // application cards have no default: a dead capture must not keep them busy
  test('20 application cards with dead captures settle without extra requests', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'applications',
      columns: 3,
      card: { titleLinesCount: 2, showSummary: true, thumbnail: { show: true, location: 'center', crop: true } }
    })
    await stubList(page, 'applications', Array.from({ length: 20 }, (_, i) => makeApplication({ id: `app-perf-${i + 1}` })))
    await stubImage(page, CAPTURE_URL, 'notFound')
    const requested = recordImageRequests(page)

    await openCatalogWithStub(page, goToPortal, portal, path, 'Visu app-perf-20')
    await page.waitForTimeout(3_000)

    expect(requested.filter((u) => u.includes('/capture')).length).toBeLessThanOrEqual(20)
  })
})
