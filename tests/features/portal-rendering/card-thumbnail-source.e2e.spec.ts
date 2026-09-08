// Which source a card picks for its thumbnail, in the order the schemas document.
// These assertions hold before and after the fallback: the fallback only changes what
// happens once a source fails, never which source is tried first.
import { test, expect } from '../../fixtures/portal.ts'
import { clean } from '../../support/axios.ts'
import {
  CAPTURE_URL, PORTAL_IMAGE_URL, REUSE_IMAGE_URL,
  createCardPortal, makeDataset, makeApplication, makeReuse,
  openCatalogWithStub, stubImage, stubList, linkedApplication, imageRef, thumbnailSrc
} from '../../support/cards.ts'

const TOPIC = { id: 'topic-1', title: 'Thematique', thumbnail: imageRef('topic-img-1', 'topic.png') }

test.describe('card thumbnail source', () => {
  test.beforeEach(clean)

  // priority 1 of the dataset card: an image set on the dataset itself
  test('a dataset image wins over the topic, the capture and the default', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      topics: [TOPIC],
      card: {
        titleLinesCount: 2,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useTopic: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({
      id: 'ds-own',
      image: 'https://images.test/own.png',
      topics: [{ id: 'topic-1', title: 'Thematique' }],
      extras: { applications: [linkedApplication('app-own')] }
    })])
    await stubImage(page, '**/images.test/**', 'ok')
    await stubImage(page, CAPTURE_URL, 'ok')
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-own')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-own' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 10_000 }).toBe('https://images.test/own.png')
  })

  // priority 2: the first topic's thumbnail. opendata-corse.edf.fr is the only client
  // that both enables useTopic and configures topic thumbnails.
  test('the first topic thumbnail is used when the dataset has no image', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      topics: [TOPIC],
      card: {
        titleLinesCount: 0,
        showSummary: true,
        thumbnail: { show: true, location: 'top', crop: true, useTopic: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({
      id: 'ds-topic',
      topics: [{ id: 'topic-1', title: 'Thematique' }],
      extras: { applications: [linkedApplication('app-topic')] }
    })])
    await stubImage(page, CAPTURE_URL, 'ok')
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-topic')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-topic' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 10_000 }).toContain('/portal/api/images/topic-img-1')
  })

  // the schema says "the first topic", so a second topic carrying a thumbnail must not
  // be reached when the first one has none
  test('only the first topic is considered', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      topics: [{ id: 'topic-plain', title: 'Sans image' }, TOPIC],
      card: {
        titleLinesCount: 2,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useTopic: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({
      id: 'ds-topic2',
      topics: [{ id: 'topic-plain', title: 'Sans image' }, { id: 'topic-1', title: 'Thematique' }]
    })])
    const served = await stubImage(page, PORTAL_IMAGE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-topic2')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-topic2' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 10_000 }).toContain('/portal/api/images/default-1')
    expect(served.urls.some((u) => u.includes('topic-img-1'))).toBe(false)
  })

  // priority 3: the capture of the first linked visualisation. opendata.staging-koumoul.com
  // is the only client with useApplication turned on.
  test('the first linked application capture is used when there is no image and no topic', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 1,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useTopic: true, useApplication: true, useSummary: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({
      id: 'ds-capture',
      extras: { applications: [linkedApplication('app-first'), linkedApplication('app-second')] }
    })])
    const served = await stubImage(page, CAPTURE_URL, 'ok')
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-capture')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-capture' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 10_000 }).toContain('/applications/app-first/capture')
    // the schema says "the first visualisation": the second one is never requested
    expect(served.urls.some((u) => u.includes('app-second'))).toBe(false)
  })

  // priority 4
  test('the default image is used when no other source is configured', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 2,
        showSummary: true,
        thumbnail: { show: true, location: 'center', crop: true, useTopic: true, useApplication: true, default: imageRef('default-1') }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-fallbackdefault' })])
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-fallbackdefault')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-fallbackdefault' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 10_000 }).toContain('/portal/api/images/default-1')
  })

  // priority 5: the summary, only in the center position and only when nothing else is available
  test('the summary replaces the thumbnail when nothing else is available', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 1,
        showSummary: false,
        thumbnail: { show: true, location: 'center', crop: true, useTopic: true, useApplication: true, useSummary: true }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-summary', summary: 'Le resume prend la place' })])

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-summary')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-summary' }).first()
    await expect(card.locator('.v-img')).toHaveCount(0)
    await expect(card.getByText('Le resume prend la place')).toBeVisible()
  })

  // useSummary only applies in the center position, the schema gates it on that
  test('useSummary does not apply to a top thumbnail', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'datasets',
      card: {
        titleLinesCount: 2,
        showSummary: false,
        thumbnail: { show: true, location: 'top', crop: true, useSummary: true }
      }
    })
    await stubList(page, 'datasets', [makeDataset({ id: 'ds-topsummary', summary: 'Resume invisible' })])

    await openCatalogWithStub(page, goToPortal, portal, path, 'Jeu ds-topsummary')

    const card = page.locator('.v-card').filter({ hasText: 'Jeu ds-topsummary' }).first()
    await expect(card.getByText('Resume invisible')).toHaveCount(0)
  })

  // the application card has its own order: image, topic, summary, then the capture
  test('an application image wins over its capture', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'applications',
      card: { titleLinesCount: 2, showSummary: true, thumbnail: { show: true, location: 'center', crop: true, useTopic: true } }
    })
    await stubList(page, 'applications', [makeApplication({ id: 'app-img', image: 'https://images.test/app.png' })])
    await stubImage(page, '**/images.test/**', 'ok')
    const captures = await stubImage(page, CAPTURE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Visu app-img')

    const card = page.locator('.v-card').filter({ hasText: 'Visu app-img' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 10_000 }).toBe('https://images.test/app.png')
    expect(captures.urls).toHaveLength(0)
  })

  // the schema puts the summary before the automatic capture for applications
  test('an application summary suppresses the capture in the center position', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'applications',
      card: { titleLinesCount: 2, showSummary: false, thumbnail: { show: true, location: 'center', crop: true, useSummary: true } }
    })
    await stubList(page, 'applications', [makeApplication({ id: 'app-sum', summary: 'Resume de la visu' })])
    const captures = await stubImage(page, CAPTURE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Visu app-sum')

    const card = page.locator('.v-card').filter({ hasText: 'Visu app-sum' }).first()
    await expect(card.locator('.v-img')).toHaveCount(0)
    await expect(card.getByText('Resume de la visu')).toBeVisible()
    expect(captures.urls).toHaveLength(0)
  })

  // without a summary the capture is used even when useSummary is on
  test('an application with no summary still falls back to its capture', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'applications',
      card: { titleLinesCount: 2, showSummary: false, thumbnail: { show: true, location: 'center', crop: true, useSummary: true } }
    })
    await stubList(page, 'applications', [makeApplication({ id: 'app-nosum', summary: '' })])
    await stubImage(page, CAPTURE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Visu app-nosum')

    const card = page.locator('.v-card').filter({ hasText: 'Visu app-nosum' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 10_000 }).toContain('/applications/app-nosum/capture')
  })

  // the reuse card only has two sources
  test('a reuse image wins over the default image', async ({ page, goToPortal }) => {
    const { portal, path } = await createCardPortal({
      kind: 'reuses',
      card: { titleLinesCount: 2, showAuthor: true, thumbnail: { show: true, location: 'center', crop: true, default: imageRef('default-1') } }
    })
    await stubList(page, 'reuses', [makeReuse({ _id: 'reuse-own', config: { image: imageRef('reuse-img-1') } })])
    await stubImage(page, REUSE_IMAGE_URL, 'ok')
    await stubImage(page, PORTAL_IMAGE_URL, 'ok')

    await openCatalogWithStub(page, goToPortal, portal, path, 'Reutilisation reuse-own')

    const card = page.locator('.v-card').filter({ hasText: 'Reutilisation reuse-own' }).first()
    await expect.poll(() => thumbnailSrc(card), { timeout: 10_000 }).toContain('/portal/api/reuses/reuse-own/images/reuse-img-1')
  })
})
