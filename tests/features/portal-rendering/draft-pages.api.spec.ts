import type { BrowserContext } from '@playwright/test'
import { test } from '../../fixtures/login.ts'
import assert from 'node:assert/strict'
import { createReadStream } from 'node:fs'
import FormData from 'form-data'
import { MongoClient } from 'mongodb'
import { axiosAuth, clean } from '../../support/axios.ts'

const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })

const baseHost = `${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
const pageUrl = (portalId: string, draft: boolean, slug: string) =>
  `http://${portalId}${draft ? '.draft' : ''}.portals.${baseHost}/portal/api/pages/generic/${slug}`

// the session cookies are host-only: copy them on the draft host of the portal
const allowDraftHost = async (context: BrowserContext, portalId: string) => {
  const cookies = (await context.cookies()).filter(c => c.name.startsWith('id_token') && c.name !== 'id_token_ex')
  await context.addCookies(cookies.map(c => ({ name: c.name, value: c.value, url: `http://${portalId}.draft.portals.${baseHost}/` })))
}

test.describe('portal page drafts', () => {
  test.beforeEach(clean)

  test('the draft host serves the page draft, the public host the published config', async ({ context, goToWithAuth }) => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    const page = (await orgAdmin.post('/api/pages', {
      type: 'generic',
      config: { title: 'A', elements: [], genericMetadata: { slug: 'published-slug' } },
      portals: [portal._id]
    })).data
    await orgAdmin.put(`/api/pages/${page._id}/draft-config`, { title: 'B', elements: [], genericMetadata: { slug: 'draft-slug' } })

    await goToWithAuth(`http://${baseHost}/portals-manager/`, 'test_admin', { org: 'test_org1' })
    await allowDraftHost(context, portal._id)
    const draft = await context.request.get(pageUrl(portal._id, true, 'draft-slug'))
    assert.equal(draft.status(), 200)
    const draftBody = await draft.json()
    assert.equal(draftBody.title, 'B')
    assert.equal(draftBody._id, page._id)
    assert.equal((await context.request.get(pageUrl(portal._id, true, 'published-slug'))).status(), 404)

    const pub = await context.request.get(pageUrl(portal._id, false, 'published-slug'))
    assert.equal(pub.status(), 200)
    assert.equal((await pub.json()).title, 'A')
    assert.equal((await context.request.get(pageUrl(portal._id, false, 'draft-slug'))).status(), 404)
  })

  test('a page only requested for the portal is served by the draft host only', async ({ context, goToWithAuth }) => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    const page = (await orgAdmin.post('/api/pages', {
      type: 'generic',
      config: { title: 'Requested', elements: [], genericMetadata: { slug: 'requested' } }
    })).data
    await orgAdmin.patch(`/api/pages/${page._id}`, { requestedPortals: [portal._id] })

    await goToWithAuth(`http://${baseHost}/portals-manager/`, 'test_admin', { org: 'test_org1' })
    await allowDraftHost(context, portal._id)
    assert.equal((await context.request.get(pageUrl(portal._id, true, 'requested'))).status(), 200)
    assert.equal((await context.request.get(pageUrl(portal._id, false, 'requested'))).status(), 404)
  })

  test('the draft host serves the images of a requested page under its draft slug', async ({ context, goToWithAuth }) => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    const page = (await orgAdmin.post('/api/pages', {
      type: 'generic',
      config: { title: 'A', elements: [], genericMetadata: { slug: 'published-slug' } }
    })).data
    await orgAdmin.put(`/api/pages/${page._id}/draft-config`, { title: 'B', elements: [], genericMetadata: { slug: 'draft-slug' } })
    await orgAdmin.patch(`/api/pages/${page._id}`, { requestedPortals: [portal._id] })
    const form = new FormData()
    form.append('body', JSON.stringify({ resource: { type: 'page', _id: page._id } }))
    form.append('image', createReadStream('tests/resources/logo.svg'))
    const image = (await orgAdmin.post('/api/images', form)).data

    await goToWithAuth(`http://${baseHost}/portals-manager/`, 'test_admin', { org: 'test_org1' })
    await allowDraftHost(context, portal._id)
    assert.equal((await context.request.get(pageUrl(portal._id, true, 'draft-slug') + `/images/${image._id}`)).status(), 200)
    assert.equal((await context.request.get(pageUrl(portal._id, false, 'published-slug') + `/images/${image._id}`)).status(), 404)
  })

  test('the draft host falls back to the published config of a page without draft', async ({ context, goToWithAuth }) => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    const page = (await orgAdmin.post('/api/pages', {
      type: 'generic',
      config: { title: 'Legacy', elements: [], genericMetadata: { slug: 'legacy' } },
      portals: [portal._id]
    })).data
    const client = await MongoClient.connect(`mongodb://localhost:${process.env.MONGO_PORT}/data-fair-portals-development`)
    try {
      await client.db().collection('pages').updateOne({ _id: page._id }, { $unset: { draftConfig: '' } })
    } finally {
      await client.close()
    }

    await goToWithAuth(`http://${baseHost}/portals-manager/`, 'test_admin', { org: 'test_org1' })
    await allowDraftHost(context, portal._id)
    const res = await context.request.get(pageUrl(portal._id, true, 'legacy'))
    assert.equal(res.status(), 200)
    assert.equal((await res.json()).title, 'Legacy')
  })
})
