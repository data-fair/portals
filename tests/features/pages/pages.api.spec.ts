import type { PageConfig, ImageElement } from '../../../api/types/page/index.ts'
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { createReadStream } from 'node:fs'
import FormData from 'form-data'
import 'dotenv/config'
import { clean, axiosAuth } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')
const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
const orgContrib = await axiosAuth({ email: 'test_contrib@test.com', org: 'test_org1' })
const deptAdmin = await axiosAuth({ email: 'test_admin_dep@test.com', org: 'test_org1' })

test.describe('pages management', () => {
  test.beforeEach(clean)

  test('should create a page', async () => {
    const pageConfig = { title: 'My page', elements: [] }
    const page = (await user1.post('/api/pages', { type: 'home', config: pageConfig })).data
    assert.equal(page.owner.id, 'test_admin')
    // the API attaches a computed table of contents (empty here, no anchored titles)
    assert.deepEqual(page.config, { ...pageConfig, _toc: [] })
    assert.deepEqual(page.draftConfig, { ...pageConfig, _toc: [] })
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

    // org-root admin moves the request into actual publication
    const accepted = (await orgAdmin.patch(`/api/pages/${page._id}`, { portals: [stagingPortal._id], requestedPortals: [] })).data
    assert.deepEqual(accepted.portals, [stagingPortal._id])
    assert.deepEqual(accepted.requestedPortals, [])
  })
})

test.describe('staging publication flow', () => {
  test.beforeEach(clean)

  test('contrib can request publication via requestedPortals but cannot publish directly', async () => {
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

  test('generates and deduplicates title anchor slugs from the content', async () => {
    const page = (await user1.post('/api/pages', { type: 'generic', title: 'P', config: { title: 'P', elements: [], genericMetadata: { slug: 'p' } } })).data
    const titleElement = (content: string) => ({ type: 'title', titleSize: 'h2', content, anchor: { enabled: true } })
    const patchElements = (elements: any[]) => user1.patch(`/api/pages/${page._id}`, { draftConfig: { title: 'P', elements, genericMetadata: { slug: 'p' } } })

    // the slug is generated from the title content
    const single = (await patchElements([titleElement('Mon Ancre')])).data
    assert.equal(single.draftConfig.elements[0].anchor._slug, 'mon-ancre')

    // duplicating a title (same content) deduplicates the generated slug in document order
    const dup = (await patchElements([titleElement('Intro'), titleElement('Intro')])).data
    assert.equal(dup.draftConfig.elements[0].anchor._slug, 'intro')
    assert.equal(dup.draftConfig.elements[1].anchor._slug, 'intro-2')

    // a disabled anchor gets no slug
    const disabled = (await patchElements([{ type: 'title', titleSize: 'h2', content: 'Plain', anchor: { enabled: false } }])).data
    assert.equal(disabled.draftConfig.elements[0].anchor._slug, undefined)
  })

  test('builds the table of contents from anchored titles, including nested ones, in order', async () => {
    const page = (await user1.post('/api/pages', { type: 'generic', title: 'P', config: { title: 'P', elements: [], genericMetadata: { slug: 'p' } } })).data

    const elements = [
      { type: 'title', titleSize: 'h2', content: 'Introduction', anchor: { enabled: true, inToc: true } },
      // an anchored title is not added to the table of contents when inToc is off
      { type: 'title', titleSize: 'h3', content: 'Anchor without toc', anchor: { enabled: true, inToc: false } },
      { type: 'title', titleSize: 'h3', content: 'No anchor' },
      {
        type: 'two-columns',
        disposition: 'equal',
        gutter: 'default',
        children: [{ type: 'title', titleSize: 'h4', content: 'In a column', anchor: { enabled: true, inToc: true } }],
        children2: [{ type: 'text', content: 'lorem' }]
      },
      // the label overrides the displayed title in the table of contents
      { type: 'title', titleSize: 'h2', content: 'Conclusion', anchor: { enabled: true, inToc: true, label: 'The end' } }
    ]
    const updated = (await user1.patch(`/api/pages/${page._id}`, { draftConfig: { title: 'P', elements, genericMetadata: { slug: 'p' } } })).data

    assert.deepEqual(updated.draftConfig._toc, [
      { id: 'introduction', title: 'Introduction' },
      { id: 'in-a-column', title: 'In a column' },
      { id: 'conclusion', title: 'The end' }
    ])

    // publishing the draft carries the computed table of contents over to the published config
    await user1.post(`/api/pages/${page._id}/draft`)
    const validated = (await user1.get(`/api/pages/${page._id}`)).data
    assert.deepEqual(validated.config._toc, updated.draftConfig._toc)
  })
})
