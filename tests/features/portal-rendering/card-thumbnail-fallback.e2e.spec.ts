// The cascade itself: when a source fails in the browser, the card must try the next
// one in the documented order, down to the default image or the summary.
//
// The failure mode that matters most is not a 404. data-fair answers a capture it
// cannot generate with a 302 to /no-preview.png, a file no instance serves any more,
// so the browser gets html where it expected an image. `capturePlaceholder` reproduces
// exactly that; `notFound` covers the deleted or unreadable application.
import { test, expect } from '../../fixtures/portal.ts'
import { clean } from '../../support/axios.ts'
import {
  CAPTURE_URL, PORTAL_IMAGE_URL, REUSE_IMAGE_URL,
  createCardPortal, makeDataset, makeApplication, makeReuse,
  openCatalogWithStub, recordImageRequests, stubImage, stubList,
  linkedApplication, imageRef, thumbnailSrc
} from '../../support/cards.ts'

const TOPIC = { id: 'topic-1', title: 'Thematique', thumbnail: imageRef('topic-img-1', 'topic.png') }

test.describe('card thumbnail fallback', () => {
  test.beforeEach(clean)

  // the whole documented chain, one broken link at a time
  test('the cascade walks image, topic, capture then default', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      topics: [TOPIC],
      card: {
        titleLinesCount: 1,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useTopic: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({
      id: 'ds-chain',
      image: 'https://images.test/broken.png',
      topics: [{ id: 'topic-1', title: 'Thematique' }],
      extras: { applications: [linkedApplication('app-chain')] }
    })])
    await stubImage(page, '**/images.test/**', 'notFound')
    await stubImage(page, '**/portal/api/images/topic-img-1', 'notFound')
    await stubImage(page, CAPTURE_URL, 'capturePlaceholder')
    await stubImage(page, '**/portal/api/images/default-1', 'ok')
    const requested = recordImageRequests(page)

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-chain')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-chain' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 20_000 }).toContain('/portal/api/images/default-1')

    // every step of the chain was really attempted, in order
    const chain = requested.filter((u) => /broken\.png|topic-img-1|capture|default-1/.test(u))
    expect(chain.findIndex((u) => u.includes('broken.png'))).toBeGreaterThanOrEqual(0)
    expect(chain.findIndex((u) => u.includes('topic-img-1'))).toBeGreaterThan(chain.findIndex((u) => u.includes('broken.png')))
    expect(chain.findIndex((u) => u.includes('capture'))).toBeGreaterThan(chain.findIndex((u) => u.includes('topic-img-1')))
    expect(chain.findIndex((u) => u.includes('default-1'))).toBeGreaterThan(chain.findIndex((u) => u.includes('capture')))
  })

  // priority 5 is only reachable once every image source has actually failed
  test('the summary takes over when every source failed', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 1,
        showSummary: false,
        thumbnail: { show: true, location: 'center', crop: true, useApplication: true, useSummary: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({
      id: 'ds-tosummary',
      summary: 'Le resume de secours',
      extras: { applications: [linkedApplication('app-tosummary')] }
    })])
    await stubImage(page, CAPTURE_URL, 'capturePlaceholder')
    await stubImage(page, PORTAL_IMAGE_URL, 'notFound')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-tosummary')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-tosummary' }).first()
    await expect(card.getByText('Le resume de secours')).toBeVisible({ timeout: 20_000 })
    await expect(card.locator('.v-img')).toHaveCount(0)
  })

  // the left location has no error event of its own, a hidden probe drives it: it
  // points at the same url as the background-image, so it must not cost a request
  test('a left thumbnail falls back too, without losing its column', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 2,
        showSummary: true,
        thumbnail: { show: true, location: 'left', crop: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-left', extras: { applications: [linkedApplication('app-left-broken')] } })])
    await stubImage(page, CAPTURE_URL, 'capturePlaceholder')
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')
    const requested = recordImageRequests(page)

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-left')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-left' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 20_000 }).toContain('/portal/api/images/default-1')
    await expect(card.locator('.v-col--cols-4')).toHaveCount(1)
    await expect(card.locator('.v-divider--vertical')).toHaveCount(1)
    await page.waitForTimeout(1_000)
    expect(requested.filter((u) => u.includes('/applications/app-left-broken/capture'))).toHaveLength(1)
    expect(requested.filter((u) => u.includes('/portal/api/images/default-1'))).toHaveLength(1)
  })

  // a capture that cannot be generated costs up to 8s of server work and answers
  // no-cache, so the second card sharing it must not pay for it again
  test('a source that failed once is not retried by the other cards', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 1,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    // three datasets pointing at the same broken visualisation
    await stubList(page, 'datasets', [1, 2, 3].map((i) => makeDataset({
      id: `ds-shared-${i}`,
      extras: { applications: [linkedApplication('app-shared')] }
    })))
    await stubImage(page, CAPTURE_URL, 'capturePlaceholder')
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')
    const requested = recordImageRequests(page)

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-shared-1')
    await expect.poll(
      () => thumbnailSrc(page.locator('.v-card').filter({ hasText: 'Jeu ds-shared-3' }).first()),
      { timeout: 20_000 }
    ).toContain('/portal/api/images/default-1')

    // the browser may coalesce the three simultaneous requests, but nothing may ask
    // for it again once it is known to fail
    const captures = requested.filter((u) => u.includes('/applications/app-shared/capture'))
    expect(captures.length).toBeLessThanOrEqual(3)

    const before = requested.length
    await page.getByRole('textbox', { name: 'Rechercher', exact: true }).fill('relance')
    await page.getByRole('textbox', { name: 'Rechercher', exact: true }).press('Enter')
    await page.waitForTimeout(3_000)
    expect(requested.slice(before).filter((u) => u.includes('/applications/app-shared/capture'))).toHaveLength(0)
  })

  // the catalog keys its cards by index, so a search hands the same card another dataset
  // while the capture of the previous one may still be pending: that late failure must
  // not be attributed to the new dataset's source
  test('a source still pending when the card is reused does not blacklist the next one', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 2,
        showSummary: true,
        thumbnail: { show: true, location: 'left', crop: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-stale', extras: { applications: [linkedApplication('app-stale')] } })])
    const stale = await stubImage(page, '**/applications/app-stale/capture**', 'capturePlaceholder', 5_000)
    await stubImage(page, '**/applications/app-fresh/capture**', 'ok')
    const defaults = await stubImage(page, PORTAL_IMAGE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-stale')
    await expect.poll(() => stale.urls.length, { timeout: 15_000 }).toBeGreaterThan(0)

    // the same card slot now shows another dataset whose capture works
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-fresh', extras: { applications: [linkedApplication('app-fresh')] } })])
    const search = page.getByRole('textbox', { name: 'Rechercher', exact: true })
    await search.fill('relance-stale')
    await search.press('Enter')
    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-fresh' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 15_000 }).toContain('/applications/app-fresh/capture')

    // long enough for the stale capture to have answered
    await page.waitForTimeout(6_000)
    expect(await thumbnailSrc(card)).toContain('/applications/app-fresh/capture')
    expect(defaults.urls).toHaveLength(0)
  })

  // an application image that fails must reach the capture behind it
  test('a broken application image falls back to the capture', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'applications',
      card: { titleLinesCount: 2, showSummary: true, thumbnail: { show: true, location: 'center', crop: true } }
    })
    await stubList(page, 'applications', [makeApplication({ id: 'app-brokenimg', image: 'https://images.test/gone.png' })])
    await stubImage(page, '**/images.test/**', 'notFound')
    await stubImage(page, CAPTURE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Visu app-brokenimg')

    const card = page.locator('.v-card').filter({ hasText: 'Visu app-brokenimg' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 20_000 }).toContain('/applications/app-brokenimg/capture')
  })

  // reuses only have two sources, but they cascade like the others
  test('a broken reuse image falls back to the default image', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'reuses',
      card: { titleLinesCount: 2, showAuthor: true, thumbnail: { show: true, location: 'center', crop: true, default: imageRef('default-1') } }
    })
    await stubList(page, 'reuses', [makeReuse({ _id: 'reuse-broken', config: { image: imageRef('reuse-img-1') } })])
    await stubImage(page, REUSE_IMAGE_URL, 'notFound')
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Reutilisation reuse-broken')

    const card = page.locator('.v-card').filter({ hasText: 'Reutilisation reuse-broken' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 20_000 }).toContain('/portal/api/images/default-1')
  })
})
