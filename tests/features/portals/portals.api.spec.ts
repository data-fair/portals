import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import 'dotenv/config'
import { clean, axiosAuth } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')
const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
const deptAdmin = await axiosAuth({ email: 'test_admin_dep@test.com', org: 'test_org1' })

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

  test('org-root admin can set contributorDepartments on an org-root portal', async () => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    const patched = (await orgAdmin.patch(`/api/portals/${portal._id}`, { contributorDepartments: ['dep1'] })).data
    assert.deepEqual(patched.contributorDepartments, ['dep1'])
  })

  test('dept admin cannot set contributorDepartments on an org-root portal', async () => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    await assert.rejects(
      deptAdmin.patch(`/api/portals/${portal._id}`, { contributorDepartments: ['dep1'] }),
      (err: any) => err.status === 403 || err.status === 401
    )
  })

  test('org-root admin can toggle staging after creation', async () => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    assert.ok(!portal.staging)
    const patched = (await orgAdmin.patch(`/api/portals/${portal._id}`, { staging: true })).data
    assert.equal(patched.staging, true)
  })

  test('dept admin cannot toggle staging on an org-root portal', async () => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    await assert.rejects(
      deptAdmin.patch(`/api/portals/${portal._id}`, { staging: true }),
      (err: any) => err.status === 403 || err.status === 401
    )
  })

  test('setting contributorDepartments on a dept-scoped portal is refused', async () => {
    const portal = (await deptAdmin.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    assert.equal(portal.owner.department, 'dep1')
    await assert.rejects(
      deptAdmin.patch(`/api/portals/${portal._id}`, { contributorDepartments: ['dep2'] }),
      (err: any) => err.status === 400
    )
  })
})
