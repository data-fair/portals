import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')
const baseHost = `${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
const portalUrl = (portalId: string) => `http://${portalId}.portals.${baseHost}`

test.describe('portal content security policy', () => {
  test.beforeEach(clean)

  test('lets the assistant reach the geocoding service its geocode_address tool calls', async ({ request }) => {
    // a judged run had every geocode_address call fail on « Refused to connect » to
    // data.geopf.fr: the tool is always registered, its endpoint was not allowed
    const portal = (await user1.post('/api/portals', { config: { title: 'CSP Portal', menu: { children: [] } } })).data
    await user1.post('/api/pages', { type: 'home', config: { title: 'Home', elements: [] }, portals: [portal._id], owner: portal.owner })
    const res = await request.get(portalUrl(portal._id), { timeout: 20_000 })
    expect(res.status()).toBe(200)
    const connectSrc = (res.headers()['content-security-policy'] ?? '').split(';').map(d => d.trim()).find(d => d.startsWith('connect-src')) ?? ''
    expect(connectSrc).toContain('https://data.geopf.fr')
  })
})
