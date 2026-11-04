// pitfalls the coding-agent skills used to teach, fixed in the API instead
import { test } from '../../fixtures/login.ts'
import assert from 'node:assert/strict'
import { axiosAuth, clean } from '../../support/axios.ts'

const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })

const errorOf = async (promise: Promise<any>) => {
  try {
    await promise
  } catch (err: any) {
    if (!err.status) throw err
    return { status: err.status as number, data: err.data }
  }
  throw new Error('the request was expected to fail')
}

test.describe('page creation pitfalls', () => {
  test.beforeEach(clean)

  test('a page created with elements has its html and toc', async () => {
    const page = (await orgAdmin.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Created with content',
        genericMetadata: { slug: 'created-with-content' },
        elements: [
          { type: 'title', content: 'Section', titleSize: 'h2', anchor: { enabled: true, inToc: true } },
          { type: 'text', content: 'Un **texte**.' },
          { type: 'alert', alertType: 'info', content: 'Une *alerte*.' }
        ]
      }
    })).data
    const stored = (await orgAdmin.get(`/api/pages/${page._id}`)).data
    for (const config of [stored.config, stored.draftConfig]) {
      assert.match(config.elements[1]._html, /<strong>texte<\/strong>/)
      assert.match(config.elements[2]._html, /<em>alerte<\/em>/)
      assert.equal(config._toc.length, 1)
      assert.equal(config._toc[0].title, 'Section')
    }
  })

  test('a missing owner name is named in the error', async () => {
    const { status, data } = await errorOf(orgAdmin.post('/api/pages', {
      type: 'home',
      owner: { type: 'organization', id: 'test_org1' },
      config: { title: 'Home', elements: [] }
    }))
    assert.equal(status, 400)
    // the field path, as in "body/owner requires the property name (name)"
    assert.match(String(data), /body\/owner\b[^\n]*\bname\b/)
  })

  test('an unknown page config key is refused', async () => {
    const page = (await orgAdmin.post('/api/pages', {
      type: 'generic',
      config: { title: 'Page', elements: [], genericMetadata: { slug: 'unknown-key' } }
    })).data
    const draftConfig = { title: 'Page', elements: [], genericMetadata: { slug: 'unknown-key' }, toc: true }
    const patchError = await errorOf(orgAdmin.patch(`/api/pages/${page._id}`, { draftConfig }))
    assert.equal(patchError.status, 400)
    assert.match(String(patchError.data), /toc/)
    const postError = await errorOf(orgAdmin.post('/api/pages', {
      type: 'generic',
      config: { title: 'Other', elements: [], genericMetadata: { slug: 'unknown-key-2' }, toc: true }
    }))
    assert.equal(postError.status, 400)
    assert.match(String(postError.data), /toc/)
    // the whole-document PUT of the editor tools refuses an unknown root key too
    const putError = await errorOf(orgAdmin.put(`/api/pages/${page._id}/draft-config`, { ...draftConfig, toc: {} }))
    assert.equal(putError.status, 400)
    assert.match(String(putError.data), /toc/)
    // what GET answers is accepted as is
    const read = (await orgAdmin.get(`/api/pages/${page._id}/draft-config`)).data
    assert.equal((await orgAdmin.put(`/api/pages/${page._id}/draft-config`, read)).status, 200)
    // a leftover property of an element is still healed, not refused
    const healed = (await orgAdmin.put(`/api/pages/${page._id}/draft-config`, {
      ...read,
      elements: [{ type: 'text', content: 'Texte', leftover: true }]
    })).data
    assert.equal(healed.elements[0].leftover, undefined)
    assert.equal(healed.elements[0].content, 'Texte')
  })

  test('a standard page created on a portal replaces the page of its type', async () => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'Portal', menu: { children: [] } } })).data
    const first = (await orgAdmin.post('/api/pages', { type: 'home', portals: [portal._id], config: { title: 'First home', elements: [] } })).data
    const second = (await orgAdmin.post('/api/pages', { type: 'home', portals: [portal._id], config: { title: 'Second home', elements: [] } })).data
    assert.deepEqual((await orgAdmin.get(`/api/pages/${first._id}`)).data.portals, [])
    assert.deepEqual((await orgAdmin.get(`/api/pages/${second._id}`)).data.portals, [portal._id])
  })

  test('a slug taken by another page of the owner is named in the conflict', async () => {
    const body = { type: 'generic', config: { title: 'Page', elements: [], genericMetadata: { slug: 'taken' } } }
    await orgAdmin.post('/api/pages', body)
    const { status, data } = await errorOf(orgAdmin.post('/api/pages', body))
    assert.equal(status, 409)
    assert.match(String(data), /A generic page with this slug already exists for this owner/)
  })
})
