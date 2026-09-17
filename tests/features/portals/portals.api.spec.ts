import type { Footer } from '../../../api/types/portal-config-footer/index.ts'
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { createReadStream } from 'node:fs'
import FormData from 'form-data'
import 'dotenv/config'
import { clean, axiosAuth, directoryUrl } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')
const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
const deptAdmin = await axiosAuth({ email: 'test_admin_dep@test.com', org: 'test_org1' })
const superadmin = await axiosAuth({ email: 'test_superadmin@test.com', adminMode: true })

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

  test('deleting a portal removes its draft site from simple-directory and keeps the production one', async () => {
    const portal = (await user1.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    const sdSiteUrl = (id: string) => `${directoryUrl}/api/sites/${encodeURIComponent(id)}`
    const draftSiteUrl = sdSiteUrl('data-fair-portals:draft-' + portal._id)
    const siteUrl = sdSiteUrl('data-fair-portals:' + portal._id)

    assert.equal((await superadmin.get(draftSiteUrl)).status, 200)
    assert.equal((await superadmin.get(siteUrl)).status, 200)

    await user1.delete(`/api/portals/${portal._id}`)

    await assert.rejects(superadmin.get(draftSiteUrl), (err: any) => err.status === 404)
    assert.equal((await superadmin.get(siteUrl)).status, 200, 'the production site must survive, it can hold accounts and SSO config')
  })

  const footerWith = (overrides: Record<string, any>): Footer => ({
    copyright: true,
    background: { color: 'primary' },
    rows: [{ columns: [{ width: 'auto', blocks: [{ type: 'links', align: 'center', display: 'inline', items: [{ type: 'standard', subtype: 'sitemap' }] }] }] }],
    ...overrides
  })

  test('new portal gets a rows footer with the sitemap link', async () => {
    const portal = (await user1.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    assert.equal(portal.config.footer.copyright, true)
    assert.equal(portal.config.footer.background.color, 'primary')
    assert.equal(portal.config.footer.rows.length, 1)
    assert.equal(portal.config.footer.rows[0].columns[0].blocks[0].type, 'links')
  })

  test('footer without any Koumoul mention is refused on a non white label portal', async () => {
    const portal = (await user1.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    const draftConfig = { ...portal.draftConfig, footer: footerWith({ copyright: false }) }
    await assert.rejects(
      user1.patch(`/api/portals/${portal._id}`, { draftConfig }),
      (err: any) => err.status === 400 && /Koumoul/.test(err.data ?? err.message)
    )
  })

  test('footer with the Koumoul logo in an images block is accepted without the copyright line', async () => {
    const portal = (await user1.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    const footer = footerWith({ copyright: false })
    footer.rows[0].columns[0].blocks.push({ type: 'images', align: 'center', height: 40, items: [{ source: 'koumoul' }] })
    const patched = (await user1.patch(`/api/portals/${portal._id}`, { draftConfig: { ...portal.draftConfig, footer } })).data
    assert.equal(patched.draftConfig.footer.copyright, false)
  })

  test('white label portal accepts a footer without Koumoul mention', async () => {
    const portal = (await user1.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    await superadmin.patch(`/api/portals/${portal._id}`, { whiteLabel: true })
    const patched = (await user1.patch(`/api/portals/${portal._id}`, { draftConfig: { ...portal.draftConfig, footer: footerWith({ copyright: false }) } })).data
    assert.equal(patched.draftConfig.footer.copyright, false)
  })

  test('markdown of footer text blocks is rendered on save', async () => {
    const portal = (await user1.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    const footer = footerWith({})
    footer.rows[0].columns[0].blocks.push({ type: 'text', align: 'left', markdown: true, content: '**bold**' })
    const patched = (await user1.patch(`/api/portals/${portal._id}`, { draftConfig: { ...portal.draftConfig, footer } })).data
    assert.match(patched.draftConfig.footer.rows[0].columns[0].blocks[1].content_html, /<strong>bold<\/strong>/)
  })

  test('duplicating a portal rewrites the footer image references', async () => {
    const portal = (await user1.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data

    const form = new FormData()
    form.append('body', JSON.stringify({ resource: { type: 'portal', _id: portal._id } }))
    form.append('image', createReadStream('tests/resources/logo.png'))
    const sourceImage = await user1.post('/api/images', form).then(r => r.data)
    const imageRef = { _id: sourceImage._id, name: 'logo.png', mimeType: sourceImage.mimeType, mobileAlt: sourceImage.mobileAlt }

    const footer = footerWith({})
    footer.background.image = imageRef
    footer.rows[0].columns[0].blocks.push({ type: 'images', align: 'left', height: 40, items: [{ source: 'upload', image: imageRef }] })
    await user1.patch(`/api/portals/${portal._id}`, { draftConfig: { ...portal.draftConfig, footer } })
    await user1.post(`/api/portals/${portal._id}/draft`)

    const copy = (await user1.post('/api/portals', { config: { title: 'Copy' }, sourcePortalId: portal._id })).data

    const copiedBackgroundImageId = copy.config.footer.background.image._id
    const copiedItemImageId = copy.config.footer.rows[0].columns[0].blocks[1].items[0].image._id
    assert.notEqual(copiedBackgroundImageId, sourceImage._id, 'background image should have a new id')
    assert.notEqual(copiedItemImageId, sourceImage._id, 'images block item image should have a new id')

    assert.equal((await user1.get(`/api/images/${copiedBackgroundImageId}/data`)).status, 200)
  })
})
