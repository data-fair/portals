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

  test('dept admin lists org-root portal when their department is in contributorDepartments', async () => {
    const sharedPortal = (await orgAdmin.post('/api/portals', { config: { title: 'Shared', menu: { children: [] } } })).data
    await orgAdmin.patch(`/api/portals/${sharedPortal._id}`, { contributorDepartments: ['dep1'] })
    const otherPortal = (await orgAdmin.post('/api/portals', { config: { title: 'Other', menu: { children: [] } } })).data
    const ownPortal = (await deptAdmin.post('/api/portals', { config: { title: 'Own', menu: { children: [] } } })).data

    const list = (await deptAdmin.get('/api/portals')).data
    const ids = list.results.map((p: any) => p._id)
    assert.ok(ids.includes(sharedPortal._id), 'shared org-root portal should be visible')
    assert.ok(ids.includes(ownPortal._id), 'own dept portal should still be visible')
    assert.ok(!ids.includes(otherPortal._id), 'unrelated org-root portal should not be visible')
  })

  test('dept admin with owner filter excludes contributorDepartments-shared portals', async () => {
    const sharedPortal = (await orgAdmin.post('/api/portals', { config: { title: 'Shared', menu: { children: [] } } })).data
    await orgAdmin.patch(`/api/portals/${sharedPortal._id}`, { contributorDepartments: ['dep1'] })
    const ownPortal = (await deptAdmin.post('/api/portals', { config: { title: 'Own', menu: { children: [] } } })).data

    const list = (await deptAdmin.get('/api/portals', { params: { owner: 'organization:test_org1:dep1' } })).data
    const ids = list.results.map((p: any) => p._id)
    assert.ok(!ids.includes(sharedPortal._id), 'contribute-only portal should be hidden with owner filter')
    assert.ok(ids.includes(ownPortal._id), 'own dept portal should still be visible')
  })

  test('dept admin owner filter cannot escalate to a different account', async () => {
    const otherOrgPortal = (await user1.post('/api/portals', { config: { title: 'OtherOrg', menu: { children: [] } } })).data

    const list = (await deptAdmin.get('/api/portals', { params: { owner: `${otherOrgPortal.owner.type}:${otherOrgPortal.owner.id}` } })).data
    const ids = list.results.map((p: any) => p._id)
    assert.ok(!ids.includes(otherOrgPortal._id), 'owner filter must not bypass session permissions')
  })

  test('dept admin can GET an org-root portal shared via contributorDepartments', async () => {
    const sharedPortal = (await orgAdmin.post('/api/portals', { config: { title: 'Shared', menu: { children: [] } } })).data
    await orgAdmin.patch(`/api/portals/${sharedPortal._id}`, { contributorDepartments: ['dep1'] })

    const fetched = (await deptAdmin.get(`/api/portals/${sharedPortal._id}`)).data
    assert.equal(fetched._id, sharedPortal._id)
  })

  test('dept admin cannot GET an org-root portal not shared with their department', async () => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data

    await assert.rejects(
      deptAdmin.get(`/api/portals/${portal._id}`),
      (err: any) => err.status === 403 || err.status === 401
    )
  })

  test('dept admin via contributorDepartments cannot patch the portal', async () => {
    const sharedPortal = (await orgAdmin.post('/api/portals', { config: { title: 'Shared', menu: { children: [] } } })).data
    await orgAdmin.patch(`/api/portals/${sharedPortal._id}`, { contributorDepartments: ['dep1'] })

    await assert.rejects(
      deptAdmin.patch(`/api/portals/${sharedPortal._id}`, { config: { ...sharedPortal.config, title: 'Hacked' } }),
      (err: any) => err.status === 403 || err.status === 401
    )
  })

  test('dept admin does not list org-root portal sharing a different department', async () => {
    const sharedPortal = (await orgAdmin.post('/api/portals', { config: { title: 'Shared', menu: { children: [] } } })).data
    await orgAdmin.patch(`/api/portals/${sharedPortal._id}`, { contributorDepartments: ['dep2'] })

    const list = (await deptAdmin.get('/api/portals')).data
    const ids = list.results.map((p: any) => p._id)
    assert.ok(!ids.includes(sharedPortal._id), 'dep1 admin must not see a portal shared only with dep2')
  })

  test('org-root admin listing is unaffected by contributorDepartments', async () => {
    const sharedPortal = (await orgAdmin.post('/api/portals', { config: { title: 'Shared', menu: { children: [] } } })).data
    await orgAdmin.patch(`/api/portals/${sharedPortal._id}`, { contributorDepartments: ['dep1'] })
    const plainPortal = (await orgAdmin.post('/api/portals', { config: { title: 'Plain', menu: { children: [] } } })).data
    const deptPortal = (await deptAdmin.post('/api/portals', { config: { title: 'Dept', menu: { children: [] } } })).data

    const list = (await orgAdmin.get('/api/portals')).data
    const ids = list.results.map((p: any) => p._id)
    assert.ok(ids.includes(sharedPortal._id))
    assert.ok(ids.includes(plainPortal._id))
    assert.ok(ids.includes(deptPortal._id), 'org-root admin sees dept-scoped portals too')
  })
})
