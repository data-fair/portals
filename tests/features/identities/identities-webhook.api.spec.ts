import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import 'dotenv/config'
import { axios, axiosAuth, clean } from '../../support/axios.ts'

const axIdentities = axios({ params: { key: 'secret-identities' }, baseURL: `http://localhost:${process.env.DEV_API_PORT}/portals-manager` })
const user1 = await axiosAuth('test_admin@test.com')

test.describe('identities webhooks', () => {
  test.beforeEach(clean)

  test('should update owner name', async () => {
    let portal = (await user1.post('/api/portals', { config: { title: 'Portal 1', menu: { children: [] } } })).data
    await axIdentities.post('/api/identities/user/test_admin', { name: 'New name' })
    portal = (await user1.get('/api/portals/' + portal._id)).data
    assert.equal(portal.owner.name, 'New name')
  })

  test('should remove resources', async () => {
    // TODO
  })
})
