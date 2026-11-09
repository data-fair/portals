import { test } from '../../fixtures/login.ts'
import assert from 'node:assert/strict'
import { MongoClient } from 'mongodb'
import { axios, axiosAuth, clean } from '../../support/axios.ts'
import { nhiSession } from '../../support/nhi.ts'
import { dataFairUrl, publicationSite } from '../../support/data-fair.ts'

const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
const orgContrib = await axiosAuth({ email: 'test_contrib@test.com', org: 'test_org1' })
const depAdmin = await axiosAuth({ email: 'test_admin_dep@test.com', org: 'test_org1', dep: 'dep1' })
const outsider = await axiosAuth('test_alone@test.com')

const baseHost = `${process.env.DEV_HOST}:${process.env.NGINX_PORT}`

// the preview needs simple-directory's pseudo sessions and the capture service: only the render cases skip without them
// with the feature enabled and the secret accepted, an empty body is refused for what it lacks; a disabled feature answers 400 too ("pseudoSession functionality is disabled")
const pseudoAvailable = await fetch(`http://localhost:${process.env.SD_PORT}/api/auth/pseudo`, { method: 'POST', headers: { 'x-secret-key': 'secret-pseudo-session', 'content-type': 'application/json' }, body: '{}' })
  .then(async res => res.status === 400 && /Missing type or id/.test(await res.text()), () => false)
const captureAvailable = await fetch(`http://localhost:${process.env.CAPTURE_PORT}/api/v1/api-docs.json`).then(res => res.status === 200, () => false)
// a render waits for the network to be idle: up to 20 s when the events service is not started
const skipUnlessRenderable = () => {
  test.slow()
  test.skip(!pseudoAvailable, 'simple-directory has no pseudo session secret in this environment')
  test.skip(!captureAvailable, 'capture is not available in this environment')
}

const statusOf = async (promise: Promise<any>) => {
  try {
    return (await promise).status
  } catch (err: any) {
    if (!err.status) throw err
    return err.status as number
  }
}

const seed = async (ax = orgAdmin, title = 'Preview page') => {
  const portal = (await ax.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
  const page = (await ax.post('/api/pages', {
    type: 'generic',
    config: { title, elements: [{ type: 'text', content: 'Un texte.' }], genericMetadata: { slug: 'preview-page' } },
    portals: [portal._id]
  })).data
  return { portal, page }
}

// the ingress of a portal points at a closed port: the render of its public host fails at once
const setIngressUrl = async (portalId: string, url: string) => {
  const client = await MongoClient.connect(`mongodb://localhost:${process.env.MONGO_PORT}/data-fair-portals-development`)
  try {
    await client.db().collection('portals').updateOne({ _id: portalId as any }, { $set: { ingress: { url } } })
  } finally {
    await client.close()
  }
}

test.describe('GET /pages/:id/preview', () => {
  test.beforeEach(clean)

  test('is refused to a session without the pages:read scope, and to an anonymous caller', async () => {
    const { page } = await seed()
    const datasetsOnly = await nhiSession('datasets:read')
    assert.equal(await statusOf(datasetsOnly.bearerAx.get(`/api/pages/${page._id}/preview`)), 403)
    assert.equal(await statusOf(orgAdmin.get('/api/pages/unknown/preview')), 404)
    assert.equal(await statusOf(axios().get(`/api/pages/${page._id}/preview`)), 401)
  })

  test('is refused to an account that cannot read the page', async () => {
    const { page } = await seed()
    assert.equal(await statusOf(outsider.get(`/api/pages/${page._id}/preview`)), 403)
  })

  test('refuses a portal the page is not attached to', async () => {
    const { page } = await seed()
    const other = (await orgAdmin.post('/api/portals', { config: { title: 'Other', menu: { children: [] } } })).data
    assert.equal(await statusOf(orgAdmin.get(`/api/pages/${page._id}/preview`, { params: { portal: other._id } })), 400)
    assert.equal(await statusOf(orgAdmin.get(`/api/pages/${page._id}/preview`, { params: { draft: 'maybe' } })), 400)
  })

  test('a page attached to no portal cannot be previewed', async () => {
    const page = (await orgAdmin.post('/api/pages', { type: 'generic', config: { title: 'Alone', elements: [], genericMetadata: { slug: 'alone' } } })).data
    assert.equal(await statusOf(orgAdmin.get(`/api/pages/${page._id}/preview`)), 400)
  })

  test('renders the draft of the page as the editor previews it', async () => {
    skipUnlessRenderable()
    const { portal, page } = await seed()
    // a draft that differs from the published page: what is rendered is the draft
    await orgAdmin.patch(`/api/pages/${page._id}`, { draftConfig: { title: 'Preview page', elements: [{ type: 'text', content: 'Texte du brouillon uniquement.' }], genericMetadata: { slug: 'preview-page' } } })
    const res = await orgAdmin.get(`/api/pages/${page._id}/preview`)
    assert.equal(res.status, 200)
    assert.equal(res.data.image.mediaType, 'image/png')
    assert.ok(res.data.image.data.length > 100)
    assert.equal(typeof res.data.text, 'string')
    assert.equal(res.data.report.url, `http://${baseHost}/portals-manager/pages/${page._id}/preview?portal=${portal._id}`)
    assert.notEqual(res.data.report.verdict, 'unauthenticated', JSON.stringify(res.data.report))
    assert.match(res.data.text, /Texte du brouillon uniquement/)
    assert.doesNotMatch(res.data.text, /Un texte\./)
  })

  test('renders the published page on the public host with draft=false', async () => {
    skipUnlessRenderable()
    const { portal, page } = await seed()
    await orgAdmin.patch(`/api/pages/${page._id}`, { draftConfig: { title: 'Preview page', elements: [{ type: 'text', content: 'Texte du brouillon uniquement.' }], genericMetadata: { slug: 'preview-page' } } })
    const res = await orgAdmin.get(`/api/pages/${page._id}/preview`, { params: { draft: false, viewport: 'mobile', fullPage: false } })
    assert.equal(res.status, 200)
    assert.ok(res.data.report.url.startsWith(`http://${portal._id}.`), res.data.report.url)
    assert.ok(res.data.report.url.endsWith('/pages/preview-page'), res.data.report.url)
    assert.match(res.data.text, /Un texte\./)
    assert.doesNotMatch(res.data.text, /Texte du brouillon/)
  })

  test('draft=false is refused for a page that is only requested on the portal', async () => {
    const { portal } = await seed()
    const page = (await orgAdmin.post('/api/pages', { type: 'generic', config: { title: 'Requested', elements: [], genericMetadata: { slug: 'requested' } } })).data
    await orgAdmin.patch(`/api/pages/${page._id}`, { requestedPortals: [portal._id] })
    assert.equal(await statusOf(orgAdmin.get(`/api/pages/${page._id}/preview`, { params: { draft: false } })), 400)
  })

  test('renders as a member of a department', async () => {
    skipUnlessRenderable()
    const { page } = await seed(depAdmin)
    const res = await depAdmin.get(`/api/pages/${page._id}/preview`)
    assert.equal(res.status, 200)
    assert.notEqual(res.data.report.verdict, 'unauthenticated', JSON.stringify(res.data.report))
  })

  test('a pages:read session renders a page embedding a private application', async () => {
    skipUnlessRenderable()
    const { portal } = await seed()
    // the application is private: only the permissions of the account read it, not the scopes of the session
    const app = (await orgAdmin.post(`${dataFairUrl}/api/v1/applications`, { url: 'https://cdn.jsdelivr.net/npm/@data-fair/app-charts@1/dist/', title: 'Private app' })).data
    try {
      await orgAdmin.patch(`${dataFairUrl}/api/v1/applications/${app.id}`, { publicationSites: [publicationSite(portal._id)] })
      const page = (await orgAdmin.post('/api/pages', {
        type: 'generic',
        config: { title: 'With app', elements: [{ type: 'application', application: { id: app.id, title: app.title, slug: app.slug } }], genericMetadata: { slug: 'with-app' } },
        portals: [portal._id]
      })).data
      const pagesRead = await nhiSession('pages:read')
      const res = await pagesRead.bearerAx.get(`/api/pages/${page._id}/preview`)
      assert.equal(res.status, 200)
      assert.notEqual(res.data.report.verdict, 'unauthenticated', JSON.stringify(res.data.report))
      // the editor preview does not embed the application (no iframe, so nothing blocked or cross-host): it shows its image
      assert.ok(!res.data.report.failedRequests.some((r: any) => r.status === 403), JSON.stringify(res.data.report.failedRequests))
      assert.match(res.data.text, /image "Private app"/)
      assert.doesNotMatch(res.data.text, /iframe/)
    } finally {
      await orgAdmin.delete(`${dataFairUrl}/api/v1/applications/${app.id}`).catch(() => {})
    }
  })

  test('refuses the calls over the rate limit', async () => {
    skipUnlessRenderable()
    const { portal, page } = await seed(orgAdmin)
    await setIngressUrl(portal._id, 'http://127.0.0.1:1')
    const statuses: number[] = []
    // defaultLimits.pagePreviews.nb
    const nb = 20
    for (let i = 0; i < nb + 1; i++) {
      statuses.push(await statusOf(orgContrib.get(`/api/pages/${page._id}/preview`, { params: { draft: false, fullPage: false } })))
    }
    assert.ok(statuses.slice(0, nb).every(status => status !== 429), statuses.join())
    assert.equal(statuses[nb], 429)
    const refused = await orgContrib.get(`/api/pages/${page._id}/preview`, { validateStatus: () => true })
    assert.match(refused.headers['retry-after'], /^\d+$/)
  })
})
