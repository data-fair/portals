import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import 'dotenv/config'
import { clean, axios, axiosAuth } from '../../support/axios.ts'

const anonymous = axios()
const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
const otherUser = await axiosAuth('test_alone@test.com')
const key = 'secret-limits'

test.describe('limits', () => {
  test.beforeEach(clean)

  test('should count pages and block creation once the limit is reached', async () => {
    let limits = (await orgAdmin.get('/api/limits/organization/test_org1')).data
    assert.deepEqual(limits.portals_nb_pages, { limit: -1, consumption: 0 })
    assert.deepEqual(limits.portals_nb_domains, { limit: -1, consumption: 0 })

    // consumption sent by customers is ignored, it is always counted
    await anonymous.post('/api/limits/organization/test_org1', {
      lastUpdate: new Date().toISOString(),
      portals_nb_pages: { limit: 1, consumption: 12 },
      portals_nb_domains: { limit: 2, consumption: 12 }
    }, { params: { key } })

    await orgAdmin.post('/api/pages', { type: 'generic', config: { title: 'Page 1', elements: [] } })
    limits = (await orgAdmin.get('/api/limits/organization/test_org1')).data
    assert.deepEqual(limits.portals_nb_pages, { limit: 1, consumption: 1 })
    assert.deepEqual(limits.portals_nb_domains, { limit: 2, consumption: 0 })

    await assert.rejects(
      orgAdmin.post('/api/pages', { type: 'home', config: { title: 'Page 2', elements: [] } }),
      { status: 429 }
    )
  })

  test('should restrict access to limits', async () => {
    await assert.rejects(anonymous.post('/api/limits/organization/test_org1', { lastUpdate: new Date().toISOString() }), { status: 401 })
    await assert.rejects(anonymous.post('/api/limits/organization/test_org1', { lastUpdate: new Date().toISOString() }, { params: { key: 'wrong' } }), { status: 401 })
    await assert.rejects(otherUser.get('/api/limits/organization/test_org1'), { status: 403 })
    await assert.rejects(orgAdmin.get('/api/limits'), { status: 403 })
    const list = (await anonymous.get('/api/limits', { params: { key } })).data
    assert.equal(list.count, 0)
  })
})
