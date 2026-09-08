// Helpers shared by the resource card specs.
//
// Card lists are fetched with useFetch: server-side on the initial SSR load, but
// client-side on every refresh. Submitting a search triggers such a refresh, so a
// route installed after the SSR load fully controls what the cards render from,
// with no data-fair seeding at all. The thumbnail requests that follow (both the
// <img> of a top/center thumbnail and the CSS background-image of a left one) are
// plain browser image requests, so they are interceptable too.
import type { Locator, Page, Route } from '@playwright/test'
import { expect } from '@playwright/test'
import { axiosAuth } from './axios.ts'

const user = await axiosAuth('test_admin@test.com')

export type CardKind = 'datasets' | 'applications' | 'reuses'

const CATALOG_ELEMENT: Record<CardKind, string> = {
  datasets: 'datasets-catalog',
  applications: 'applications-catalog',
  reuses: 'reuses-catalog'
}

const LIST_ENDPOINT: Record<CardKind, string> = {
  datasets: '**/data-fair/api/v1/datasets**',
  applications: '**/data-fair/api/v1/applications?**',
  reuses: '**/portal/api/reuses?**'
}

export const CAPTURE_URL = '**/data-fair/api/v1/applications/*/capture**'
export const PORTAL_IMAGE_URL = '**/portal/api/images/**'
export const REUSE_IMAGE_URL = '**/portal/api/reuses/*/images/**'

/** 1x1 transparent PNG, small enough to inline and a valid image for the browser */
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

export const createCardPortal = async (opts: {
  kind: CardKind
  card: Record<string, any>
  topics?: Record<string, any>[]
  columns?: number
  title?: string
}) => {
  const { kind, card, topics, columns = 3, title = 'Card Portal' } = opts
  const config: Record<string, any> = {
    title,
    menu: { children: [] },
    [kind]: { card }
  }
  if (topics) config.topics = topics

  const portal = (await user.post('/api/portals', { config })).data
  await user.post('/api/pages', {
    type: 'home',
    config: { title: 'Accueil', elements: [{ type: 'title', content: 'Accueil cartes', titleSize: 'h2' }] },
    portals: [portal._id],
    owner: portal.owner
  })
  await user.post('/api/pages', {
    type: kind,
    config: {
      title: 'Catalogue',
      elements: [{ uuid: 'cat1', type: CATALOG_ELEMENT[kind], columns, filters: { items: ['search'] } }]
    },
    portals: [portal._id],
    owner: portal.owner
  })
  return { portal, path: `/${kind}` }
}

/** Serve `items` for the card list of `kind`. Counts how many times it answered. */
export const stubList = async (page: Page, kind: CardKind, items: any[]) => {
  const state = { hits: 0 }
  await page.route(LIST_ENDPOINT[kind], async (route: Route) => {
    state.hits++
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: items.length, results: items })
    })
  })
  return state
}

export type ImageOutcome =
  /** a real, decodable image */
  | 'ok'
  /** the application was deleted or is not readable */
  | 'notFound'
  /** what data-fair really answers when a capture cannot be generated: a redirect
   *  to /no-preview.png, which no instance serves any more and comes back as html */
  | 'capturePlaceholder'
  /** network-level failure (dns, tls, offline) */
  | 'abort'

/**
 * Serve `outcome` for every request matching `glob`. Records the urls it answered.
 * `delayMs` reproduces how long a real capture takes: data-fair tries to generate it
 * twice with a 4s pause in between before giving up.
 */
export const stubImage = async (page: Page, glob: string, outcome: ImageOutcome, delayMs = 0) => {
  // `urls` records the requests as they arrive, `answered` only once the delay elapsed,
  // so a test can assert something happened while the image was still pending
  const state = { urls: [] as string[], answered: 0 }
  await page.route(glob, async (route: Route) => {
    state.urls.push(route.request().url())
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs))
    state.answered++
    if (outcome === 'abort') return route.abort()
    if (outcome === 'notFound') return route.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' })
    if (outcome === 'capturePlaceholder') {
      return route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: '<!DOCTYPE html><html><head><title>data-fair</title></head><body><div id="app"></div></body></html>'
      })
    }
    return route.fulfill({ status: 200, contentType: 'image/png', body: PNG_1X1 })
  })
  return state
}

/** Every image request the page issued, whatever its outcome. */
export const recordImageRequests = (page: Page) => {
  const urls: string[] = []
  page.on('request', (r) => { if (r.resourceType() === 'image') urls.push(r.url()) })
  return urls
}

/**
 * Load the catalog, then submit a search so the list is refetched client-side and
 * answered by the stub. A search submitted before hydration does nothing, so it is
 * retried with a new term each time until the expected card shows up.
 */
export const openCatalogWithStub = async (
  page: Page,
  goToPortal: (portalId: string, path?: string) => Promise<void>,
  portal: { _id: string },
  path: string,
  expectedText: string | RegExp
) => {
  await goToPortal(portal._id, path)
  const search = page.getByRole('textbox', { name: 'Rechercher', exact: true })
  await expect(search).toBeVisible({ timeout: 15_000 })

  const expected = page.getByText(expectedText).first()
  let attempt = 0
  await expect.poll(async () => {
    if (await expected.isVisible()) return true
    await search.fill(`carte-${attempt++}`)
    await search.press('Enter')
    return expected.isVisible()
  }, { timeout: 25_000 }).toBe(true)
}

/**
 * The url the card is actually showing, whatever the location: a top/center
 * thumbnail is a v-img with a real <img>, a left one is a background-image.
 * Returns undefined when the card shows no thumbnail at all.
 */
export const thumbnailSrc = async (card: Locator) => {
  return card.evaluate((el) => {
    const img = el.querySelector('.v-img__img') as HTMLImageElement | null
    if (img?.getAttribute('src')) return img.getAttribute('src')!
    const bg = el.querySelector('.v-col--cols-4 > div[aria-hidden="true"]') as HTMLElement | null
    if (!bg) return undefined
    const m = /url\(["']?(.*?)["']?\)/.exec(getComputedStyle(bg).backgroundImage)
    return m ? m[1] : undefined
  })
}

let seq = 0
const nextId = (prefix: string) => `${prefix}-${++seq}`

export const makeDataset = (over: Record<string, any> = {}) => {
  const id = over.id ?? nextId('ds')
  return {
    id,
    slug: id,
    title: `Jeu ${id}`,
    summary: `Resume de ${id}`,
    updatedAt: '2026-01-01T00:00:00.000Z',
    dataUpdatedAt: '2026-01-01T00:00:00.000Z',
    owner: { type: 'organization', id: 'test_org', name: 'Test Org' },
    isMetaOnly: false,
    public: true,
    userPermissions: [],
    ...over
  }
}

export const makeApplication = (over: Record<string, any> = {}) => {
  const id = over.id ?? nextId('app')
  return {
    id,
    slug: id,
    title: `Visu ${id}`,
    summary: `Resume de ${id}`,
    updatedAt: '2026-01-01T00:00:00.000Z',
    owner: { type: 'organization', id: 'test_org', name: 'Test Org' },
    url: 'https://koumoul.com/apps/probe/1/',
    href: `http://data-fair.test/data-fair/api/v1/applications/${id}`,
    exposedUrl: `http://data-fair.test/data-fair/app/${id}`,
    public: true,
    ...over
  }
}

export const makeReuse = (over: Record<string, any> = {}) => {
  const id = over._id ?? nextId('reuse')
  const { config: configOver, ...rest } = over
  return {
    _id: id,
    slug: id,
    updatedAt: '2026-01-01T00:00:00.000Z',
    config: {
      title: `Reutilisation ${id}`,
      summary: `Resume de ${id}`,
      author: 'Auteur test',
      ...configOver
    },
    ...rest
  }
}

/** An application entry as it appears in dataset.extras.applications */
export const linkedApplication = (id: string) => ({
  id,
  slug: id,
  updatedAt: '2026-01-01T00:00:00.000Z'
})

export const imageRef = (id: string, name = 'image.png') => ({
  _id: id,
  name,
  mimeType: 'image/png'
})
