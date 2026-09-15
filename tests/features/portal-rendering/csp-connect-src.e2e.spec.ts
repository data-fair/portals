import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

const baseHost = `${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
const portalUrl = (portalId: string) => `http://${portalId}.portals.${baseHost}`

const connectSrc = (csp: string | undefined) => {
  const directive = (csp ?? '').split(';').map(d => d.trim()).find(d => d.startsWith('connect-src'))
  return (directive ?? '').split(/\s+/).slice(1)
}

test.describe('CSP connect-src', () => {
  test.beforeEach(clean)

  test('allows the IGN Geoplateforme host used by the geocode_address agent tool', async ({ request }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'CSP Portal', menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    const res = await request.get(portalUrl(portal._id) + '/', { timeout: 20_000 })
    expect(res.status()).toBe(200)
    const sources = connectSrc(res.headers()['content-security-policy'])
    expect(sources).toContain("'self'")
    // the geocode_address tool fetches https://data.geopf.fr/geocodage/search from the browser
    expect(sources).toContain('https://data.geopf.fr')
  })

  test('analytics patch keeps the base connect-src sources', async ({ request }) => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'CSP Portal Matomo',
        menu: { children: [] },
        analytics: { tracker: { type: 'matomo', params: { trackerBase: 'https://stats.example.com/', siteId: '1' } } }
      }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })

    const res = await request.get(portalUrl(portal._id) + '/', { timeout: 20_000 })
    expect(res.status()).toBe(200)
    const sources = connectSrc(res.headers()['content-security-policy'])
    expect(sources).toContain('https://stats.example.com/')
    expect(sources).toContain('https://data.geopf.fr')
  })
})
