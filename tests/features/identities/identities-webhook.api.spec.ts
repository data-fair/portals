import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import 'dotenv/config'
import { axios, axiosAuth, clean } from '../../support/axios.ts'

// identity webhooks are internal calls: simple-directory reaches the API directly, not through the proxy
const axIdentities = axios({ headers: { 'x-secret-key': 'secret-identities' }, baseURL: `http://localhost:${process.env.DEV_API_PORT}/portals-manager` })
const user1 = await axiosAuth('test_admin@test.com')
const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })

const seedResources = async (ax: any) => {
  const portal = (await ax.post('/api/portals', { config: { title: 'Portal 1', menu: { children: [] } } })).data
  const page = (await ax.post('/api/pages', { type: 'home', config: { title: 'My page', elements: [] } })).data
  const group = (await ax.post('/api/groups', { title: 'Group 1', description: 'A group' })).data
  return { portal, page, group }
}

test.describe('identities webhooks', () => {
  test.beforeEach(clean)

  test('should update the owner name on every resource', async () => {
    const { portal, page, group } = await seedResources(user1)
    await axIdentities.post('/api/identities/user/test_admin', { name: 'New name' })
    assert.equal((await user1.get('/api/portals/' + portal._id)).data.owner.name, 'New name')
    assert.equal((await user1.get('/api/pages/' + page._id)).data.owner.name, 'New name')
    assert.equal((await user1.get('/api/groups/' + group._id)).data.owner.name, 'New name')
  })

  test('should update the department name on every resource', async () => {
    const { portal, page, group } = await seedResources(orgAdmin)
    await axIdentities.post('/api/identities/organization/test_org1', { name: 'Renamed Org', departments: [{ id: 'dep1', name: 'Renamed Department' }] })
    for (const [path, id] of [['portals', portal._id], ['pages', page._id], ['groups', group._id]]) {
      const owner = (await orgAdmin.get(`/api/${path}/${id}`)).data.owner
      assert.equal(owner.name, 'Renamed Org')
    }
  })

  test('should remove every resource of a deleted identity', async () => {
    const { portal, page, group } = await seedResources(user1)
    await axIdentities.delete('/api/identities/user/test_admin')
    await assert.rejects(user1.get('/api/portals/' + portal._id), { status: 404 })
    await assert.rejects(user1.get('/api/pages/' + page._id), { status: 404 })
    await assert.rejects(user1.get('/api/groups/' + group._id), { status: 404 })
  })
})
