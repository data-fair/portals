import { strict as assert } from 'node:assert'
import { it, describe, before, beforeEach, after } from 'node:test'
import { clean, startApiServer, stopApiServer, axiosAuth } from './utils/index.ts'

const user1 = await axiosAuth('user1@test.com')

describe('portals management', () => {
  before(startApiServer)
  beforeEach(clean)
  after(stopApiServer)

  it('should create a portal', async () => {
    const portalConfig = { title: 'Portal 1', authentication: 'optional' }
    const portal = (await user1.post('/api/portals', { config: portalConfig })).data
    assert.equal(portal.owner.id, 'user1')
    assert.deepEqual(portal.config, portalConfig)
    assert.deepEqual(portal.draftConfig, portalConfig)
  })
})
