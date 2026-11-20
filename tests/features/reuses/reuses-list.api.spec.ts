import { test } from '../../fixtures/login.ts'
import assert from 'node:assert/strict'
import 'dotenv/config'
import { clean, axiosAuth } from '../../support/axios.ts'

const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
const otherUser = await axiosAuth('test_alone@test.com')

test.describe('reuses list', () => {
  test.beforeEach(clean)

  test('filters and counts reuses by portal and requested portal', async () => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'Portal', menu: { children: [] } } })).data
    const published = (await orgAdmin.post('/api/reuses', { config: { title: 'Published' }, portals: [portal._id] })).data
    const requested = (await orgAdmin.post('/api/reuses', { config: { title: 'Requested' } })).data
    await orgAdmin.patch(`/api/reuses/${requested._id}`, { requestedPortals: [portal._id] })
    await orgAdmin.post('/api/reuses', { config: { title: 'Other' } })

    const all = (await orgAdmin.get('/api/reuses')).data
    assert.equal(all.count, 3)
    assert.deepEqual(all.facets, { portals: { [portal._id]: 1 }, requestedPortals: { [portal._id]: 1 } })

    const byPortal = (await orgAdmin.get('/api/reuses', { params: { portal: portal._id } })).data
    assert.deepEqual(byPortal.results.map((r: any) => r._id), [published._id])

    // size=0 returns the count and the facets only
    const pending = (await orgAdmin.get('/api/reuses', { params: { requestedPortal: portal._id, size: 0 } })).data
    assert.equal(pending.count, 1)
    assert.deepEqual(pending.results, [])
    assert.deepEqual(pending.facets.requestedPortals, { [portal._id]: 1 })
  })

  test('a reuse is attached only to the portals of its owner', async () => {
    const otherPortal = (await otherUser.post('/api/portals', { config: { title: 'Other portal', menu: { children: [] } } })).data
    await assert.rejects(orgAdmin.post('/api/reuses', { config: { title: 'Intruder' }, portals: [otherPortal._id] }),
      (err: any) => err.status === 400 && String(err.data).includes(`portal "${otherPortal._id}"`))
    const reuse = (await orgAdmin.post('/api/reuses', { config: { title: 'Reuse' } })).data
    await assert.rejects(orgAdmin.patch(`/api/reuses/${reuse._id}`, { portals: [otherPortal._id] }),
      (err: any) => err.status === 400 && String(err.data).includes(`portal "${otherPortal._id}"`))
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'Portal', menu: { children: [] } } })).data
    assert.deepEqual((await orgAdmin.patch(`/api/reuses/${reuse._id}`, { portals: [portal._id] })).data.portals, [portal._id])
  })
})
