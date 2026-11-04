import { test } from '../../fixtures/login.ts'
import assert from 'node:assert/strict'
import { createReadStream } from 'node:fs'
import FormData from 'form-data'
import type { AxiosInstance } from 'axios'
import { axios, axiosAuth, clean } from '../../support/axios.ts'
import { nhiSession } from '../../support/nhi.ts'

// the test NHI is admin of test_org1, as this cookie user
const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })

const statusOf = async (promise: Promise<any>) => {
  try {
    return (await promise).status
  } catch (err: any) {
    if (!err.status) throw err
    return err.status as number
  }
}

const scoped = async (scope?: string) => (await nhiSession(scope)).bearerAx

const createPage = (ax: AxiosInstance) => ax.post('/api/pages', { type: 'generic', config: { title: 'Scoped page', elements: [], genericMetadata: {} } })
const createReuse = (ax: AxiosInstance) => ax.post('/api/reuses', { config: { title: 'Scoped reuse' } })
const createGroup = (ax: AxiosInstance) => ax.post('/api/groups', { title: 'Scoped group' })
const createPortal = (ax: AxiosInstance) => ax.post('/api/portals', { config: { title: 'Scoped portal', menu: { children: [] } } })

// the resources of a family, with the routes a tier opens or not
const families = {
  pages: { list: '/api/pages', create: createPage, path: '/api/pages', draft: true },
  groups: { list: '/api/groups', create: createGroup, path: '/api/groups', draft: false },
  reuses: { list: '/api/reuses', create: createReuse, path: '/api/reuses', draft: true }
} as const
const scopeFamily = { pages: 'pages', groups: 'pages', reuses: 'reuses' } as const

test.describe('scope enforcement', () => {
  test.beforeEach(clean)

  for (const [name, resource] of Object.entries(families)) {
    const family = scopeFamily[name as keyof typeof scopeFamily]
    test(`${name}: the read tier lists and cannot create`, async () => {
      const ax = await scoped(`${family}:read`)
      assert.equal(await statusOf(ax.get(resource.list)), 200)
      assert.equal(await statusOf(resource.create(ax)), 403)
    })

    test(`${name}: the write tier creates, cannot delete nor publish`, async () => {
      const ax = await scoped(`${family}:write`)
      const created = await resource.create(ax)
      assert.equal(created.status, 201)
      assert.equal(await statusOf(ax.get(`${resource.path}/${created.data._id}`)), 200)
      assert.equal(await statusOf(ax.delete(`${resource.path}/${created.data._id}`)), 403)
      if (resource.draft) {
        assert.equal(await statusOf(ax.post(`${resource.path}/${created.data._id}/draft`)), 403)
        assert.equal(await statusOf(ax.delete(`${resource.path}/${created.data._id}/draft`)), 204)
      }
      assert.equal(await statusOf(orgAdmin.get(`${resource.path}/${created.data._id}`)), 200)
    })

    for (const scope of [`${family}:admin`, family, 'all:admin']) {
      test(`${name}: ${scope} publishes and deletes`, async () => {
        const ax = await scoped(scope)
        const created = await resource.create(ax)
        if (resource.draft) assert.equal(await statusOf(ax.post(`${resource.path}/${created.data._id}/draft`)), 204)
        assert.equal(await statusOf(ax.delete(`${resource.path}/${created.data._id}`)), 204)
      })
    }
  }

  test('portals: the read tier lists and reads, the write tier cannot publish nor delete, the admin tier publishes', async () => {
    const portal = (await createPortal(orgAdmin)).data
    const read = await scoped('portals:read')
    assert.equal(await statusOf(read.get('/api/portals')), 200)
    assert.equal(await statusOf(read.get(`/api/portals/${portal._id}`)), 200)
    assert.equal(await statusOf(read.get('/api/font-assets')), 200)
    assert.equal(await statusOf(createPortal(read)), 403)
    assert.equal(await statusOf(read.delete(`/api/portals/${portal._id}/draft`)), 403)

    const write = await scoped('portals:write')
    assert.equal(await statusOf(write.delete(`/api/portals/${portal._id}/draft`)), 204)
    assert.equal(await statusOf(write.post(`/api/portals/${portal._id}/draft`)), 403)
    assert.equal(await statusOf(write.delete(`/api/portals/${portal._id}`)), 403)
    assert.equal(await statusOf(createPortal(write)), 403)

    // an unchanged draft: no publication site to sync in data-fair
    assert.equal(await statusOf((await scoped('portals:admin')).post(`/api/portals/${portal._id}/draft`)), 204)
    assert.equal(await statusOf((await scoped('all:admin')).post(`/api/portals/${portal._id}/draft`)), 204)
  })

  test('a scope of another family is refused', async () => {
    const pagesAdmin = await scoped('pages:admin')
    assert.equal(await statusOf(pagesAdmin.get('/api/portals')), 403)
    assert.equal(await statusOf(pagesAdmin.get('/api/reuses')), 403)
    assert.equal(await statusOf(pagesAdmin.get('/api/font-assets')), 403)
    assert.equal(await statusOf((await scoped('reuses:admin')).get('/api/groups')), 403)
  })

  test('images: the family is the one of the resource, from the body and from the stored image', async () => {
    const portal = (await createPortal(orgAdmin)).data
    const page = (await createPage(orgAdmin)).data
    const upload = (ax: AxiosInstance, resource: { type: string, _id: string }) => {
      const form = new FormData()
      form.append('body', JSON.stringify({ resource }))
      form.append('image', createReadStream('tests/resources/logo.png'))
      return ax.post('/api/images', form)
    }
    const pagesWrite = await scoped('pages:write')
    assert.equal(await statusOf(upload(await scoped('pages:admin'), { type: 'portal', _id: portal._id })), 403)
    assert.equal(await statusOf(upload(await scoped('pages:read'), { type: 'page', _id: page._id })), 403)
    const pageImage = await upload(pagesWrite, { type: 'page', _id: page._id })
    assert.equal(pageImage.status, 200)
    const portalImage = (await upload(orgAdmin, { type: 'portal', _id: portal._id })).data

    const pagesRead = await scoped('pages:read')
    assert.equal(await statusOf(pagesRead.get(`/api/images/${pageImage.data._id}/data`)), 200)
    assert.equal(await statusOf(pagesRead.get(`/api/images/${portalImage._id}/data`)), 403)
    assert.equal(await statusOf((await scoped('portals:read')).get(`/api/images/${portalImage._id}/data`)), 200)
    assert.equal(await statusOf(pagesRead.get('/api/images/unknown/data')), 404)
  })

  test('routes refused on purpose and any-scope routes', async () => {
    const portal = (await createPortal(orgAdmin)).data
    const portalsRead = await scoped('portals:read')
    assert.equal(await statusOf(portalsRead.get('/api/admin/info')), 403)
    assert.equal(await statusOf(portalsRead.post(`/api/portals/${portal._id}/ingress`, { url: 'https://example.com' })), 403)
    assert.equal(await statusOf(portalsRead.get('/api/limits')), 403)

    const pagesRead = await scoped('pages:read')
    assert.equal(await statusOf(pagesRead.get(`/api/portals/${portal._id}/public`)), 200)
    assert.equal(await statusOf(pagesRead.get('/api/fonts')), 200)
    assert.equal(await statusOf(pagesRead.get('/api/limits/organization/test_org1')), 200)
    assert.equal(await statusOf(pagesRead.get('/api/ping')), 200)
  })

  test('the scopes of the service are public', async () => {
    const anonymous = (await axios().get('/api/scopes.json', { headers: { 'accept-language': 'en' } })).data
    assert.equal(anonymous['pages:read'], "Read the account's pages and page groups")
    assert.ok(anonymous['all:admin'])
    const fr = (await (await scoped('pages:read')).get('/api/scopes.json')).data
    assert.equal(fr['pages:read'], 'Lire les pages et les groupes de pages du compte')
  })

  test('unrestricted sessions keep their full access', async () => {
    const { bearerAx, cookieAx } = await nhiSession()
    for (const ax of [bearerAx, cookieAx, orgAdmin]) {
      assert.equal(await statusOf(ax.get('/api/portals')), 200)
      const page = (await createPage(ax)).data
      assert.equal(await statusOf(ax.post(`/api/pages/${page._id}/draft`)), 204)
      assert.equal(await statusOf(ax.delete(`/api/pages/${page._id}`)), 204)
    }
  })

  test('a scoped session by cookie is enforced as by bearer', async () => {
    const { cookieAx } = await nhiSession('pages:read')
    assert.equal(await statusOf(cookieAx.get('/api/pages')), 200)
    assert.equal(await statusOf(createPage(cookieAx)), 403)
    assert.equal(await statusOf(cookieAx.get('/api/portals')), 403)
  })
})
