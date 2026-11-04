import { test } from '../../fixtures/login.ts'
import assert from 'node:assert/strict'
import { axiosAuth, clean } from '../../support/axios.ts'
import { nhiSession } from '../../support/nhi.ts'
import { MongoClient } from 'mongodb'

// the test NHI is admin of test_org1, as orgAdmin
const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
const orgContrib = await axiosAuth({ email: 'test_contrib@test.com', org: 'test_org1' })
const outsider = await axiosAuth('test_alone@test.com')

const statusOf = async (promise: Promise<any>) => {
  try {
    return (await promise).status
  } catch (err: any) {
    if (!err.status) throw err
    return err.status as number
  }
}

// old editors stored properties the schema rejects (leftovers of an element type switch): they are
// injected directly in the database of the dev API
const injectLegacyData = async (pageId: string, mongoPatch: Record<string, any>) => {
  const client = await MongoClient.connect(`mongodb://localhost:${process.env.MONGO_PORT}/data-fair-portals-development`)
  try {
    const result = await client.db().collection('pages').updateOne({ _id: pageId as any }, mongoPatch)
    if (result.matchedCount !== 1) throw new Error(`mongo legacy data injection matched ${result.matchedCount} pages`)
  } finally {
    await client.close()
  }
}

const createPage = async () => (await orgAdmin.post('/api/pages', {
  type: 'generic',
  config: { title: 'Draft page', elements: [], genericMetadata: { slug: 'draft-page' } }
})).data

test.describe('page draft config', () => {
  test.beforeEach(clean)

  test('a whole draft config is saved and read back with its rendered markdown', async () => {
    const page = await createPage()
    const draftConfig = { title: 'Edited', elements: [{ type: 'text', content: 'Un **texte**.' }], genericMetadata: { slug: 'draft-page' } }
    const saved = (await orgAdmin.put(`/api/pages/${page._id}/draft-config`, draftConfig)).data
    assert.match(saved.elements[0]._html, /<strong>texte<\/strong>/)
    assert.deepEqual(saved._toc, [])

    const read = (await orgAdmin.get(`/api/pages/${page._id}/draft-config`)).data
    assert.deepEqual(read, saved)
    // the published config is untouched, and the stored document is the one read back
    const stored = (await orgAdmin.get(`/api/pages/${page._id}`)).data
    assert.equal(stored.config.title, 'Draft page')
    assert.deepEqual(stored.draftConfig, read)
    // what is read is accepted as is
    assert.equal(await statusOf(orgAdmin.put(`/api/pages/${page._id}/draft-config`, read)), 200)
  })

  test('a stored draft with leftover properties is read healed, and saved again as read', async () => {
    const page = (await orgAdmin.post('/api/pages', {
      type: 'generic',
      config: { title: 'Legacy page', elements: [{ uuid: 'el000001', type: 'title', titleSize: 'h3', content: 'hello' }], genericMetadata: { slug: 'legacy-page' } }
    })).data
    await injectLegacyData(page._id, { $set: { 'draftConfig.elements.0.mb': 0 } })
    assert.equal((await orgAdmin.get(`/api/pages/${page._id}`)).data.draftConfig.elements[0].mb, 0)

    const read = (await orgAdmin.get(`/api/pages/${page._id}/draft-config`)).data
    assert.equal(read.elements[0].mb, undefined)
    assert.equal(read.elements[0].content, 'hello')
    const saved = (await orgAdmin.put(`/api/pages/${page._id}/draft-config`, read)).data
    assert.deepEqual(saved, read)
    // a leftover sent back is stripped the same way
    const resaved = (await orgAdmin.put(`/api/pages/${page._id}/draft-config`, { ...read, elements: [{ ...read.elements[0], mb: 0 }] })).data
    assert.equal(resaved.elements[0].mb, undefined)
  })

  test('an invalid draft config is refused with the validation message', async () => {
    const page = await createPage()
    await assert.rejects(
      orgAdmin.put(`/api/pages/${page._id}/draft-config`, { elements: [] }),
      (err: any) => err.status === 400 && /title/.test(err.data)
    )
  })

  test('a contributor of the owner edits the draft, an outsider cannot', async () => {
    const page = await createPage()
    assert.equal(await statusOf(orgContrib.put(`/api/pages/${page._id}/draft-config`, { title: 'By contrib', elements: [], genericMetadata: { slug: 'draft-page' } })), 200)
    assert.equal(await statusOf(outsider.get(`/api/pages/${page._id}/draft-config`)), 403)
    assert.equal(await statusOf(outsider.put(`/api/pages/${page._id}/draft-config`, { title: 'By outsider', elements: [] })), 403)
  })

  test('the read tier reads the draft config and its schema, the write tier saves it', async () => {
    const page = await createPage()
    const read = (await nhiSession('pages:read')).bearerAx
    assert.equal(await statusOf(read.get(`/api/pages/${page._id}/draft-config`)), 200)
    assert.equal(await statusOf(read.get(`/api/pages/${page._id}/draft-config/schema`)), 200)
    assert.equal(await statusOf(read.put(`/api/pages/${page._id}/draft-config`, { title: 'Read', elements: [], genericMetadata: { slug: 'draft-page' } })), 403)
    const write = (await nhiSession('pages:write')).bearerAx
    assert.equal(await statusOf(write.put(`/api/pages/${page._id}/draft-config`, { title: 'Write', elements: [], genericMetadata: { slug: 'draft-page' } })), 200)
  })

  test('the schema of the draft config is the page editor form for the type of the page', async () => {
    const page = await createPage()
    const res = await orgAdmin.get(`/api/pages/${page._id}/draft-config/schema`)
    assert.equal(res.data.title, 'PageConfigSimple')
    assert.ok(res.data.properties.elements)
    assert.equal(res.data.properties.genericMetadata.layout.if, '("generic") === "generic"')
    assert.equal(res.data.properties.eventMetadata.layout.if, '("generic") === "event"')
    assert.ok(!JSON.stringify(res.data).includes('"$ref":"https://'), 'refs are local')
    assert.ok(!JSON.stringify(res.data).includes('context.pages'), 'no expression reads the form context')
    assert.equal(await statusOf(outsider.get(`/api/pages/${page._id}/draft-config/schema`)), 403)
  })
})
