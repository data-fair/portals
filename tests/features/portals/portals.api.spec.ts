import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import 'dotenv/config'
import { clean, axiosAuth } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('portals management', () => {
  test.beforeEach(clean)

  test('should create a portal', async () => {
    const portalConfig = { title: 'Portal 1', menu: { children: [] } }
    const portal = (await user1.post('/api/portals', { config: portalConfig })).data
    assert.equal(portal.owner.id, 'test_admin')
    assert.equal(portal.config.authentication, 'optional')
    assert.equal(portal.config.theme.colors.primary, '#1976D2')
    assert.deepEqual(portal.config, portal.draftConfig)
  })
})
