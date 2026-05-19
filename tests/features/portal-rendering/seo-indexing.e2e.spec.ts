import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

const baseHost = `${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
const portalUrl = (portalId: string, draft = false) => `http://${portalId}${draft ? '.draft' : ''}.portals.${baseHost}`

const fetchHtml = async (request: import('@playwright/test').APIRequestContext, url: string) => {
  const res = await request.get(url, { headers: { 'accept-language': 'fr' }, timeout: 20_000 })
  expect(res.status()).toBe(200)
  return res.text()
}

const hasRobotsNoindex = (html: string) => /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) ||
  /<meta[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(html)

const extractMetaContent = (html: string, name: string, attr: 'name' | 'property' = 'name') => {
  const regexA = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i')
  const regexB = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${name}["']`, 'i')
  const m = html.match(regexA) || html.match(regexB)
  return m?.[1]
}

const extractCanonical = (html: string) => {
  const m = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i)
  return m?.[1]
}

const extractJsonLd = (html: string) => {
  const m = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
  if (!m) return null
  return JSON.parse(m[1])
}

test.describe('SEO / indexation', () => {
  test.beforeEach(clean)

  test('home indexable when allowRobots=true', async ({ request }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Indexable Portal', description: 'Desc', allowRobots: true, menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    const html = await fetchHtml(request, portalUrl(portal._id) + '/')
    expect(hasRobotsNoindex(html)).toBe(false)
  })

  test('home noindex when allowRobots=false', async ({ request }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Hidden Portal', allowRobots: false, menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    const html = await fetchHtml(request, portalUrl(portal._id) + '/')
    expect(hasRobotsNoindex(html)).toBe(true)
  })

  test('home noindex when allowRobots not set (default)', async ({ request }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Default Portal', menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    const html = await fetchHtml(request, portalUrl(portal._id) + '/')
    expect(hasRobotsNoindex(html)).toBe(true)
  })

  test('draft URL is auth-gated (cannot be crawled anonymously)', async ({ request }) => {
    // Draft URLs trigger middleware/2.auth.ts which forces authentication regardless
    // of portal config. This is the primary protection against indexing of drafts;
    // the noindex meta in app.vue is defense-in-depth.
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Draftable Portal', allowRobots: true, menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    const res = await request.get(portalUrl(portal._id, true) + '/', { timeout: 20_000 })
    const html = await res.text()
    // Anonymous request should not be served the portal HTML — instead the
    // simple-directory login UI is rendered.
    expect(html).toContain('/simple-directory/')
    expect(html).not.toContain('Draftable Portal')

    // Production URL is reachable normally and has no noindex
    const prodHtml = await fetchHtml(request, portalUrl(portal._id) + '/')
    expect(hasRobotsNoindex(prodHtml)).toBe(false)
  })

  test('robots.txt reflects portal indexability', async ({ request }) => {
    const indexable = (await user1.post('/api/portals', {
      config: { title: 'A', allowRobots: true, menu: { children: [] } }
    })).data
    await user1.post('/api/pages', { type: 'home', config: { title: 'Home', elements: [] }, portals: [indexable._id], owner: indexable.owner })

    const hidden = (await user1.post('/api/portals', {
      config: { title: 'B', allowRobots: false, menu: { children: [] } }
    })).data
    await user1.post('/api/pages', { type: 'home', config: { title: 'Home', elements: [] }, portals: [hidden._id], owner: hidden.owner })

    const okRobots = await (await request.get(portalUrl(indexable._id) + '/robots.txt')).text()
    expect(okRobots).toContain('Allow: /')
    expect(okRobots).toContain('Sitemap:')

    const koRobots = await (await request.get(portalUrl(hidden._id) + '/robots.txt')).text()
    expect(koRobots).toContain('Disallow: /')
    expect(koRobots).not.toContain('Sitemap:')
  })

  test('open graph + canonical + JSON-LD on home', async ({ request }) => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'OG Portal',
        description: 'Description du portail pour SEO',
        allowRobots: true,
        menu: { children: [] }
      }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    const url = portalUrl(portal._id) + '/'
    const html = await fetchHtml(request, url)

    // Open Graph
    expect(extractMetaContent(html, 'og:title', 'property')).toBe('OG Portal')
    expect(extractMetaContent(html, 'og:description', 'property')).toBe('Description du portail pour SEO')
    expect(extractMetaContent(html, 'og:type', 'property')).toBe('website')
    expect(extractMetaContent(html, 'og:url', 'property')).toBeTruthy()

    // Canonical
    const canonical = extractCanonical(html)
    expect(canonical).toBeTruthy()
    expect(canonical).not.toContain('?')

    // JSON-LD
    const jsonLd = extractJsonLd(html)
    expect(jsonLd).toBeTruthy()
    expect(jsonLd['@context']).toBe('https://schema.org')
    expect(jsonLd['@type']).toBe('WebSite')
    expect(jsonLd.name).toBe('OG Portal')
    expect(jsonLd.description).toBe('Description du portail pour SEO')
  })

  test('dataset sub-pages are noindex (table, map, api-doc)', async ({ request }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Sub Portal', allowRobots: true, menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    // No real dataset is needed: the page component still mounts and calls usePageSeo
    // even when the data-fair fetch returns 404.
    for (const sub of ['table', 'map', 'api-doc']) {
      const html = await fetchHtml(request, portalUrl(portal._id) + `/datasets/fake-slug/${sub}`)
      expect(hasRobotsNoindex(html), `dataset/${sub} should be noindex`).toBe(true)
    }
  })

  test('application full sub-page is noindex', async ({ request }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'App Portal', allowRobots: true, menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    const html = await fetchHtml(request, portalUrl(portal._id) + '/applications/fake-slug/full')
    expect(hasRobotsNoindex(html)).toBe(true)
  })

  test('catalog-api-doc remains indexable', async ({ request }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Cat Portal', allowRobots: true, menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    const html = await fetchHtml(request, portalUrl(portal._id) + '/catalog-api-doc')
    expect(hasRobotsNoindex(html)).toBe(false)
  })
})
