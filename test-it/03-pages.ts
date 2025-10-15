import { strict as assert } from 'node:assert'
import { it, describe, before, beforeEach, after } from 'node:test'
import { clean, startApiServer, stopApiServer, axiosAuth } from './utils/index.ts'

const user1 = await axiosAuth('user1@test.com')

describe('pages management', () => {
  before(startApiServer)
  beforeEach(clean)
  after(stopApiServer)

  it('should create a page', async () => {
    const pageConfig = { title: 'My page', elements: [] }
    const page = (await user1.post('/api/pages', { type: 'home', config: pageConfig })).data
    assert.equal(page.owner.id, 'user1')
    assert.deepEqual(page.config, pageConfig)
    assert.deepEqual(page.draftConfig, pageConfig)
  })
})
