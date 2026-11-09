import type { PageConfig, ImageElement } from '../../../api/types/page/index.ts'
import { test } from '../../fixtures/login.ts'
import assert from 'node:assert/strict'
import { createReadStream } from 'node:fs'
import FormData from 'form-data'
import 'dotenv/config'
import { clean, axiosAuth } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')
const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
const orgContrib = await axiosAuth({ email: 'test_contrib@test.com', org: 'test_org1' })
const deptAdmin = await axiosAuth({ email: 'test_admin_dep@test.com', org: 'test_org1' })
const superadmin = await axiosAuth({ email: 'test_superadmin@test.com', adminMode: true })

test.describe('pages management', () => {
  test.beforeEach(clean)

  test('should create a page', { tag: '@smoke' }, async () => {
    const pageConfig = { title: 'My page', elements: [] }
    const page = (await user1.post('/api/pages', { type: 'home', config: pageConfig })).data
    assert.equal(page.owner.id, 'test_admin')
    // the API attaches a computed table of contents (empty here, no anchored titles)
    assert.deepEqual(page.config, { ...pageConfig, _toc: [] })
    assert.deepEqual(page.draftConfig, { ...pageConfig, _toc: [] })
  })

  // the page previews draw a text block from its rendered _html: a judged simulation found the
  // back-office previews of a page created with content empty until its draft was edited
  test('should render the markdown of a page created with text blocks', async () => {
    const page = (await user1.post('/api/pages', {
      type: 'generic',
      config: { title: 'Text page', elements: [{ type: 'text', content: 'Un **texte**.' }], genericMetadata: { slug: 'text-page' } }
    })).data
    const stored = (await user1.get(`/api/pages/${page._id}`)).data
    assert.match(stored.config.elements[0]._html, /<strong>texte<\/strong>/)
    assert.match(stored.draftConfig.elements[0]._html, /<strong>texte<\/strong>/)
  })

  test('should create a catalog page with a search bar and a sort', async () => {
    const datasets = (await user1.post('/api/pages', { type: 'datasets', config: { title: 'Data', elements: [] } })).data
    assert.deepEqual(datasets.config.elements[0].filters, { position: 'top', items: ['search', 'sort'] })
    const events = (await user1.post('/api/pages', { type: 'event-catalog', config: { title: 'Events', elements: [] } })).data
    assert.deepEqual(events.draftConfig.elements[0].filters, { position: 'top', items: ['search', 'include-past', 'sort'] })
  })

  test('should duplicate a page with an image', async () => {
    const sourcePageConfig: PageConfig = {
      title: 'Source page',
      elements: []
    }
    const sourcePage = (await user1.post('/api/pages', { type: 'home', config: sourcePageConfig })).data

    // Upload an image for the source page
    const form = new FormData()
    form.append('body', JSON.stringify({ resource: { type: 'page', _id: sourcePage._id } }))
    form.append('image', createReadStream('tests/resources/logo.png'))
    const sourceImage = await user1.post('/api/images', form).then(r => r.data)

    // Add image element to the source page
    const imageElement: ImageElement = {
      type: 'image',
      uuid: 'srcuuid1',
      image: {
        _id: sourceImage._id,
        mimeType: sourceImage.mimeType,
        mobileAlt: sourceImage.mobileAlt,
        name: 'logo.png'
      }
    }
    sourcePageConfig.elements = [imageElement]
    await user1.patch(`/api/pages/${sourcePage._id}`, { draftConfig: sourcePageConfig })
    await user1.post(`/api/pages/${sourcePage._id}/draft`)

    // Duplicate the page with sourcePageId
    const duplicatedPage = (await user1.post('/api/pages', {
      type: 'generic',
      sourcePageId: sourcePage._id,
      config: { title: 'Duplicated page', elements: [] }
    })).data

    assert.equal(duplicatedPage.owner.id, 'test_admin')
    assert.equal(duplicatedPage.config.title, 'Duplicated page')
    assert.equal(duplicatedPage.config.elements.length, 1, 'Duplicated page should have one element')
    assert.equal(duplicatedPage.config.elements[0].type, 'image')

    // Check that the image was duplicated with a new ID
    const duplicatedImageId = duplicatedPage.config.elements[0].image._id
    assert.notEqual(duplicatedImageId, sourceImage._id, 'Image should have a new ID')

    // Copied elements must get a fresh uuid so identity-keyed features (e.g. the per-uuid
    // shared-filters agent tool) don't collide with the source page during client-side navigation
    const duplicatedUuid = duplicatedPage.config.elements[0].uuid
    assert.ok(duplicatedUuid, 'Duplicated element should have a uuid')
    assert.notEqual(duplicatedUuid, 'srcuuid1', 'Duplicated element should get a new uuid')

    // Verify the duplicated image exists in database
    const duplicatedImageData = await user1.get(`/api/images/${duplicatedImageId}/data`)
    assert.equal(duplicatedImageData.status, 200, 'Duplicated image should be accessible')
  })
})

test.describe('contributorDepartments page publication', () => {
  test.beforeEach(clean)

  test('dept admin publishes a dept-owned page on a non-staging org-root portal listed via contributorDepartments', async () => {
    const sharedPortal = (await orgAdmin.post('/api/portals', { config: { title: 'Shared', menu: { children: [] } } })).data
    await orgAdmin.patch(`/api/portals/${sharedPortal._id}`, { contributorDepartments: ['dep1'] })

    const page = (await deptAdmin.post('/api/pages', { type: 'generic', title: 'Dept page', config: { title: 'Dept page', elements: [], genericMetadata: { slug: 'dept-page' } } })).data
    assert.equal(page.owner.department, 'dep1')

    const patched = (await deptAdmin.patch(`/api/pages/${page._id}`, { portals: [sharedPortal._id] })).data
    assert.deepEqual(patched.portals, [sharedPortal._id])
    assert.deepEqual(patched.requestedPortals, [])
  })

  test('dept admin requests publication of a dept-owned page on a staging org-root portal listed via contributorDepartments', async () => {
    const stagingPortal = (await orgAdmin.post('/api/portals', { config: { title: 'Staging', menu: { children: [] } } })).data
    await orgAdmin.patch(`/api/portals/${stagingPortal._id}`, { staging: true, contributorDepartments: ['dep1'] })

    const page = (await deptAdmin.post('/api/pages', { type: 'generic', title: 'Dept page', config: { title: 'Dept page', elements: [], genericMetadata: { slug: 'dept-page' } } })).data

    const patched = (await deptAdmin.patch(`/api/pages/${page._id}`, { requestedPortals: [stagingPortal._id] })).data
    assert.deepEqual(patched.requestedPortals, [stagingPortal._id])
    assert.deepEqual(patched.portals, [])

    // the org-root admin finds the request through the requestedPortal filter and facet
    const pending = (await orgAdmin.get('/api/pages', { params: { requestedPortal: stagingPortal._id, size: 0 } })).data
    assert.equal(pending.count, 1)
    assert.deepEqual(pending.results, [])
    assert.deepEqual(pending.facets.requestedPortals, { [stagingPortal._id]: 1 })

    // org-root admin moves the request into actual publication
    const accepted = (await orgAdmin.patch(`/api/pages/${page._id}`, { portals: [stagingPortal._id], requestedPortals: [] })).data
    assert.deepEqual(accepted.portals, [stagingPortal._id])
    assert.deepEqual(accepted.requestedPortals, [])
  })
})

test.describe('staging publication flow', () => {
  test.beforeEach(clean)

  test('contrib can request publication via requestedPortals but cannot publish directly', { tag: '@smoke' }, async () => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'Staging', menu: { children: [] } } })).data
    await orgAdmin.patch(`/api/portals/${portal._id}`, { staging: true })
    const page = (await orgAdmin.post('/api/pages', { type: 'generic', title: 'P', config: { title: 'P', elements: [], genericMetadata: { slug: 'p' } } })).data

    // Contrib cannot patch portals directly
    await assert.rejects(
      orgContrib.patch(`/api/pages/${page._id}`, { portals: [portal._id] }),
      (err: any) => err.status === 403 || err.status === 401
    )

    // Contrib can request publication
    const requested = (await orgContrib.patch(`/api/pages/${page._id}`, { requestedPortals: [portal._id] })).data
    assert.deepEqual(requested.requestedPortals, [portal._id])
    assert.deepEqual(requested.portals, [])
  })

  // the slug and table of contents logic is unit-tested in page-anchors.unit.spec.ts
  test('stores the anchor slugs and the table of contents of the draft, and publishes them', async () => {
    const page = (await user1.post('/api/pages', { type: 'generic', title: 'P', config: { title: 'P', elements: [], genericMetadata: { slug: 'p' } } })).data
    const elements = [{ type: 'title', titleSize: 'h2', content: 'Mon Ancre', anchor: { enabled: true, inToc: true } }]
    const updated = (await user1.patch(`/api/pages/${page._id}`, { draftConfig: { title: 'P', elements, genericMetadata: { slug: 'p' } } })).data
    assert.equal(updated.draftConfig.elements[0].anchor._slug, 'mon-ancre')
    assert.deepEqual(updated.draftConfig._toc, [{ id: 'mon-ancre', title: 'Mon Ancre' }])

    await user1.post(`/api/pages/${page._id}/draft`)
    const validated = (await user1.get(`/api/pages/${page._id}`)).data
    assert.deepEqual(validated.config._toc, updated.draftConfig._toc)
  })
})

test.describe('page transfer', () => {
  test.beforeEach(clean)

  const uploadPageImage = async (ax: typeof orgAdmin, pageId: string) => {
    const form = new FormData()
    form.append('body', JSON.stringify({ resource: { type: 'page', _id: pageId } }))
    form.append('image', createReadStream('tests/resources/logo.png'))
    return (await ax.post('/api/images', form)).data
  }

  test('the page images follow it to another department and back to the organization', async () => {
    const page = (await orgAdmin.post('/api/pages', { type: 'generic', config: { title: 'Org page', elements: [], genericMetadata: { slug: 'org-page' } } })).data
    const image = await uploadPageImage(orgAdmin, page._id)

    const dep1 = { type: 'organization', id: 'test_org1', name: 'Test Org 1', department: 'dep1', departmentName: 'Department 1' }
    await orgAdmin.patch(`/api/pages/${page._id}`, { owner: dep1 })
    assert.equal((await deptAdmin.get(`/api/images/${image._id}/data`)).status, 200)

    await orgAdmin.patch(`/api/pages/${page._id}`, { owner: { type: 'organization', id: 'test_org1', name: 'Test Org 1' } })
    assert.equal((await orgAdmin.get(`/api/images/${image._id}/data`)).status, 200)
    assert.equal((await deptAdmin.get(`/api/images/${image._id}/data`, { validateStatus: () => true })).status, 404)
  })

  test('a standard page transferred and attached in one PATCH replaces the new owner\'s page of its type', async () => {
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'Org portal', menu: { children: [] } } })).data
    const orgContact = (await orgAdmin.post('/api/pages', { type: 'contact', config: { title: 'Contact', elements: [] }, portals: [portal._id] })).data
    assert.deepEqual(orgContact.portals, [portal._id])

    // from another account (a superadmin may transfer between accounts): the page to replace is the new owner's
    const personalContact = (await user1.post('/api/pages', { type: 'contact', config: { title: 'New contact', elements: [] } })).data
    const moved = (await superadmin.patch(`/api/pages/${personalContact._id}`, {
      owner: { type: 'organization', id: 'test_org1', name: 'Test Org 1' },
      portals: [portal._id]
    })).data
    assert.deepEqual(moved.portals, [portal._id])
    assert.deepEqual((await orgAdmin.get(`/api/pages/${orgContact._id}`)).data.portals, [])
  })
})
