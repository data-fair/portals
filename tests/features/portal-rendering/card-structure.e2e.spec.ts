// Structural characterization of the resource cards, captured before the thumbnail
// fallback lands so any layout drift it causes shows up here.
import { test, expect } from '../../fixtures/portal.ts'
import { clean } from '../../support/axios.ts'
import {
  CAPTURE_URL, PORTAL_IMAGE_URL,
  createCardPortal, makeDataset, makeApplication, makeReuse,
  openCatalogWithStub, stubImage, stubList, linkedApplication, imageRef
} from '../../support/cards.ts'

test.describe('card structure', () => {
  test.beforeEach(clean)

  // data.corsica renders application cards with the thumbnail on the left, which is
  // the only location that goes through a background-image div instead of a v-img.
  test('a left thumbnail keeps its column, its divider and its background style', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'applications',
      card: {
        actionsLocation: 'bottom',
        actionsStyle: 'full',
        titleLinesCount: 2,
        showSummary: true,
        thumbnail: { show: true, location: 'left', crop: true, useTopic: false }
      }
    })
    await stubList(page, 'applications', [makeApplication({ id: 'app-left' })])
    await stubImage(page, CAPTURE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Visu app-left')

    const card = page.locator('.v-card').filter({ hasText: 'Visu app-left' }).first()
    await expect(card.locator('.v-col--cols-4')).toHaveCount(1)
    await expect(card.locator('.v-divider--vertical')).toHaveCount(1)

    const thumb = card.locator('.v-col--cols-4 > div[aria-hidden="true"]')
    await expect(thumb).toHaveCount(1)
    const style = await thumb.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { image: cs.backgroundImage, size: cs.backgroundSize, position: cs.backgroundPosition, repeat: cs.backgroundRepeat, minHeight: cs.minHeight }
    })
    expect(style.image).toContain('/capture?updatedAt=')
    expect(style.size).toBe('cover')
    expect(style.position).toBe('50% 50%')
    expect(style.repeat).toBe('no-repeat')
    expect(style.minHeight).toBe('200px')
  })

  // data.laposte.fr is the only client that turns cropping off
  test('crop false renders the left thumbnail with contain', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'applications',
      card: { titleLinesCount: 2, showSummary: true, thumbnail: { show: true, location: 'left', crop: false } }
    })
    await stubList(page, 'applications', [makeApplication({ id: 'app-contain' })])
    await stubImage(page, CAPTURE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Visu app-contain')

    const thumb = page.locator('.v-card').filter({ hasText: 'Visu app-contain' }).first().locator('.v-col--cols-4 > div[aria-hidden="true"]')
    expect(await thumb.evaluate((el) => getComputedStyle(el).backgroundSize)).toBe('contain')
  })

  // The empty column is what today's markup renders when no source is available, and
  // the fallback must not start removing it: that would reflow every existing portal.
  test('a left thumbnail with no available source keeps the column and the divider', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'reuses',
      card: { titleLinesCount: 2, showAuthor: true, thumbnail: { show: true, location: 'left', crop: true } }
    })
    await stubList(page, 'reuses', [makeReuse({ _id: 'reuse-noimg' })])

    await openCatalogWithStub(page, goToPortal, portal, path, 'Reutilisation reuse-noimg')

    const card = page.locator('.v-card').filter({ hasText: 'Reutilisation reuse-noimg' }).first()
    await expect(card.locator('.v-col--cols-4')).toHaveCount(1)
    await expect(card.locator('.v-divider--vertical')).toHaveCount(1)
    await expect(card.locator('.v-col--cols-4 > div[aria-hidden="true"]')).toHaveCount(0)
  })

  // opendata.edf.fr puts the dataset thumbnail on top, above the title
  test('a top thumbnail renders a v-img before the title', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 2,
        showSummary: true,
        thumbnail: { show: true, location: 'top', crop: true, useApplication: true }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-top', extras: { applications: [linkedApplication('app-top')] } })])
    await stubImage(page, CAPTURE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-top')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-top' }).first()
    await expect(card.locator('.v-img')).toHaveCount(1)
    // the thumbnail block precedes the title block in document order
    const imageBeforeTitle = await card.evaluate((el) => {
      const img = el.querySelector('.v-img')!
      const title = el.querySelector('.v-card-title')!
      return !!(img.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING)
    })
    expect(imageBeforeTitle).toBe(true)
    expect(await card.locator('.v-img').evaluate((el) => getComputedStyle(el).height)).toBe('170px')
  })

  // the default location, used by nearly every client
  test('a center thumbnail renders a v-img after the title', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 1,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useApplication: true }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-center', extras: { applications: [linkedApplication('app-center')] } })])
    await stubImage(page, CAPTURE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-center')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-center' }).first()
    await expect(card.locator('.v-img')).toHaveCount(1)
    const titleBeforeImage = await card.evaluate((el) => {
      const img = el.querySelector('.v-img')!
      const title = el.querySelector('.v-card-title')!
      return !!(title.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING)
    })
    expect(titleBeforeImage).toBe(true)
  })

  // opendata.koumoul.com and opendata.agenceore.fr turn dataset thumbnails off entirely
  test('show false renders no thumbnail at all', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: { titleLinesCount: 2, showSummary: true, thumbnail: { show: false, location: 'center', crop: true, useApplication: true } }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-noshow', image: 'https://example.invalid/x.png', extras: { applications: [linkedApplication('app-noshow')] } })])

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-noshow')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-noshow' }).first()
    await expect(card.locator('.v-img')).toHaveCount(0)
    await expect(card.locator('.v-col--cols-4')).toHaveCount(0)
  })

  // the card link is an overlay covering the whole card, thumbnail included
  test('the card link covers the thumbnail', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: { titleLinesCount: 2, showSummary: true, thumbnail: { show: true, location: 'center', crop: true, useApplication: true } }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-overlay', extras: { applications: [linkedApplication('app-overlay')] } })])
    await stubImage(page, CAPTURE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-overlay')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-overlay' }).first()
    const img = card.locator('.v-img')
    await expect(img).toBeVisible()
    const box = (await img.boundingBox())!
    const href = await page.evaluate(([x, y]) => {
      const el = document.elementFromPoint(x as number, y as number)
      return el?.closest('a')?.getAttribute('href') ?? null
    }, [box.x + box.width / 2, box.y + box.height / 2])
    expect(href).toBe('/datasets/ds-overlay')
  })

  // opendata-corse.edf.fr sets titleLinesCount 0, opendata.koumoul.com 1, most others 2
  for (const [lines, clamp] of [[0, 'none'], [2, '2']] as const) {
    test(`titleLinesCount ${lines} drives the title clamp`, async ({ page, goToPortal }) => {
      const { portal, path } = await createCardPortal({
        kind: 'datasets',
        card: { titleLinesCount: lines, showSummary: true, thumbnail: { show: false } }
      })
      await stubList(page, 'datasets', [makeDataset({ id: `ds-lines${lines}` })])

      await openCatalogWithStub(page, goToPortal, portal, path, `Jeu ds-lines${lines}`)

      const title = page.locator('.v-card').filter({ hasText: `Jeu ds-lines${lines}` }).first().locator('.v-card-title')
      expect(await title.evaluate((el) => getComputedStyle(el).webkitLineClamp)).toBe(clamp)
    })
  }

  // a reuse thumbnail comes from the reuse's own image route, not the portal one
  test('a reuse image is served from the reuse image route', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'reuses',
      card: { titleLinesCount: 2, showAuthor: true, thumbnail: { show: true, location: 'center', crop: true } }
    })
    await stubList(page, 'reuses', [makeReuse({ _id: 'reuse-img', config: { image: imageRef('img-1') } })])
    const served = await stubImage(page, '**/portal/api/reuses/**', 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Reutilisation reuse-img')

    await expect.poll(() => served.urls.length, { timeout: 10_000 }).toBeGreaterThan(0)
    expect(served.urls[0]).toContain('/portal/api/reuses/reuse-img/images/img-1')
  })

  // opendata-corse.edf.fr is the only client with a default dataset image
  test('the default image is used when the dataset has no other source', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 0,
        showSummary: true,
        thumbnail: { show: true, location: 'top', crop: true, useApplication: false, useTopic: true, default: imageRef('default-1', 'EDF-Datasets.png') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-default' })])
    const served = await stubImage(page, PORTAL_IMAGE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-default')

    await expect.poll(() => served.urls.some((u) => u.includes('/portal/api/images/default-1')), { timeout: 10_000 }).toBe(true)
  })
})
