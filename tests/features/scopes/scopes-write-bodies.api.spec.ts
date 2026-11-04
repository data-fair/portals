import { test } from '../../fixtures/login.ts'
import assert from 'node:assert/strict'
import { axiosAuth, clean } from '../../support/axios.ts'
import { nhiSession } from '../../support/nhi.ts'

// the test NHI is admin of test_org1, as this cookie user
const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
const owner = { type: 'organization', id: 'test_org1', name: 'Test Org 1' }

const statusOf = async (promise: Promise<any>) => {
  try {
    return (await promise).status
  } catch (err: any) {
    if (!err.status) throw err
    return err.status as number
  }
}

const scoped = async (scope: string) => (await nhiSession(scope)).bearerAx

const newPortal = async () => (await orgAdmin.post('/api/portals', { config: { title: 'Portal', menu: { children: [] } } })).data

// some body properties raise the tier of a write: they are refused to the write tier before anything is written
test.describe('scope tier of write bodies', () => {
  test.beforeEach(clean)

  test('pages: the write tier edits the draft, not the portals nor the owner', async () => {
    const portal = await newPortal()
    const page = (await orgAdmin.post('/api/pages', { type: 'generic', config: { title: 'Page', elements: [], genericMetadata: {} } })).data
    const write = await scoped('pages:write')
    const draftConfig = { ...page.draftConfig, title: 'Draft by write' }
    assert.equal(await statusOf(write.patch(`/api/pages/${page._id}`, { draftConfig })), 200)
    assert.equal(await statusOf(write.patch(`/api/pages/${page._id}`, { draftConfig: { ...draftConfig, title: 'Refused' }, portals: [portal._id] })), 403)
    assert.equal(await statusOf(write.patch(`/api/pages/${page._id}`, { owner })), 403)
    const stored = (await orgAdmin.get(`/api/pages/${page._id}`)).data
    assert.equal(stored.draftConfig.title, 'Draft by write')
    assert.deepEqual(stored.portals, [])
    // creating directly on a portal is a publication
    assert.equal(await statusOf(write.post('/api/pages', { type: 'generic', config: { title: 'P', elements: [], genericMetadata: {} }, portals: [portal._id] })), 403)

    assert.equal(await statusOf((await scoped('pages:admin')).patch(`/api/pages/${page._id}`, { portals: [portal._id] })), 200)
    assert.deepEqual((await orgAdmin.get(`/api/pages/${page._id}`)).data.portals, [portal._id])
  })

  test('reuses: the write tier edits the draft, not the live config, the portals nor the owner', async () => {
    const portal = await newPortal()
    const reuse = (await orgAdmin.post('/api/reuses', { config: { title: 'Reuse' } })).data
    const write = await scoped('reuses:write')
    const draftConfig = { ...reuse.draftConfig, title: 'Draft by write' }
    assert.equal(await statusOf(write.patch(`/api/reuses/${reuse._id}`, { draftConfig })), 200)
    assert.equal(await statusOf(write.patch(`/api/reuses/${reuse._id}`, { draftConfig: { ...draftConfig, title: 'Refused' }, portals: [portal._id] })), 403)
    assert.equal(await statusOf(write.patch(`/api/reuses/${reuse._id}`, { owner })), 403)
    const stored = (await orgAdmin.get(`/api/reuses/${reuse._id}`)).data
    assert.equal(stored.draftConfig.title, 'Draft by write')
    assert.deepEqual(stored.portals, [])
    assert.equal(await statusOf(write.post('/api/reuses', { config: { title: 'R' }, portals: [portal._id] })), 403)
    // the live config is published content: writing it directly is a publication
    assert.equal(await statusOf(write.patch(`/api/reuses/${reuse._id}`, { config: { ...reuse.config, title: 'Live by write' } })), 403)
    assert.equal((await orgAdmin.get(`/api/reuses/${reuse._id}`)).data.config.title, 'Reuse')

    assert.equal(await statusOf((await scoped('reuses:admin')).patch(`/api/reuses/${reuse._id}`, { portals: [portal._id] })), 200)
    assert.deepEqual((await orgAdmin.get(`/api/reuses/${reuse._id}`)).data.portals, [portal._id])
    assert.equal(await statusOf((await scoped('reuses:admin')).patch(`/api/reuses/${reuse._id}`, { config: { ...reuse.config, title: 'Live by admin' } })), 200)
    assert.equal((await orgAdmin.get(`/api/reuses/${reuse._id}`)).data.config.title, 'Live by admin')
  })

  test('portals: the write tier edits the draft, not the contributor departments nor the owner', async () => {
    const portal = await newPortal()
    const write = await scoped('portals:write')
    const draftConfig = { ...portal.draftConfig, title: 'Draft by write' }
    assert.equal(await statusOf(write.patch(`/api/portals/${portal._id}`, { draftConfig })), 200)
    assert.equal(await statusOf(write.patch(`/api/portals/${portal._id}`, { draftConfig: { ...draftConfig, title: 'Refused' }, contributorDepartments: ['dep1'] })), 403)
    assert.equal(await statusOf(write.patch(`/api/portals/${portal._id}`, { staging: true })), 403)
    assert.equal(await statusOf(write.patch(`/api/portals/${portal._id}`, { owner })), 403)
    const stored = (await orgAdmin.get(`/api/portals/${portal._id}`)).data
    assert.equal(stored.draftConfig.title, 'Draft by write')
    assert.equal(stored.contributorDepartments, undefined)

    // the owner does not change the publication site, nothing to sync in data-fair
    assert.equal(await statusOf((await scoped('portals:admin')).patch(`/api/portals/${portal._id}`, { owner })), 200)
  })
})
