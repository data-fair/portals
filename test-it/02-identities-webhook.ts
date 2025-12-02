import { strict as assert } from 'node:assert'
import { describe, it, before, beforeEach, after } from 'node:test'
import { axios, axiosAuth, clean, startApiServer, stopApiServer } from './utils/index.ts'

const axIdentities = axios({ params: { key: 'secret-identities' }, baseURL: 'http://localhost:8097/portals-manager' })
const user1 = await axiosAuth('admin@test.com')

describe('identities webhooks', () => {
  before(startApiServer)
  beforeEach(clean)
  after(stopApiServer)

  it('should update owner name', async () => {
    let portal = (await user1.post('/api/portals', { config: { title: 'Portal 1', menu: {} } })).data
    await axIdentities.post('/api/identities/user/adminOrga', { name: 'New name' })
    portal = (await user1.get('/api/portals/' + portal._id)).data
    assert.equal(portal.owner.name, 'New name')
  })

  it('should remove resources', async () => {
    // TODO
  })
})
