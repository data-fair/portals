import { strict as assert } from 'node:assert'
import { it, describe, before, beforeEach, after } from 'node:test'
import 'dotenv/config'
import { clean, startApiServer, stopApiServer, axiosAuth } from './utils/index.ts'

const user1 = await axiosAuth('admin@test.com')

describe('portals management', () => {
  before(startApiServer)
  beforeEach(clean)
  after(stopApiServer)

  it('should create a portal', async () => {
    const portalConfig = { title: 'Portal 1', menu: { children: [] } }
    const portal = (await user1.post('/api/portals', { config: portalConfig })).data
    assert.equal(portal.owner.id, 'adminOrga')
    assert.equal(portal.config.authentication, 'optional')
    assert.equal(portal.config.theme.colors.primary, '#1976D2')
    assert.deepEqual(portal.config, portal.draftConfig)
  })
})
