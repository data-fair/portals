import { strict as assert } from 'node:assert'
import { it, describe, before, beforeEach, after } from 'node:test'
import 'dotenv/config'
import { clean, startApiServer, stopApiServer, axiosAuth } from './utils/index.ts'

const user1 = await axiosAuth('admin@test.com')

describe('search page indexes', () => {
  before(startApiServer)
  beforeEach(clean)
  after(stopApiServer)

  it('should index a page when search engine is activated', async () => {
    // 1. Create a portal and activate the search engine in its config
    const portalConfig = {
      title: 'Portal with search',
      menu: { children: [] },
      searchEngine: {
        active: true,
        types: ['page']
      }
    }
    const portal = (await user1.post('/api/portals', { config: portalConfig })).data
    assert.equal(portal.config.searchEngine.active, true)

    // 2. Add a page and associate it with the portal
    const page = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Test Page',
        elements: [],
        genericMetadata: {
          slug: 'test-page',
          description: 'This is a test page for search indexing'
        }
      },
      portals: [portal._id],
      owner: portal.owner
    })).data
    assert.equal(page.config.title, 'Test Page')
    assert.ok(page.portals.includes(portal._id), 'Page should be associated with portal')

    // 3. Query the search page indexes as admin of the org owner of portal
    const { results: indexes } = (await user1.get('/api/search-page-indexes')).data
    assert.ok(Array.isArray(indexes))

    const portalIndexes = indexes.filter((idx: any) => idx.portal === portal._id)
    assert.ok(portalIndexes.length > 0, 'Should have at least one indexed page')

    const indexedPage = portalIndexes.find((idx: any) => idx.resource.id === page._id)
    assert.ok(indexedPage, 'Page should be indexed')
    assert.equal(indexedPage.path, '/pages/test-page')
  })

  it('should not index pages when search engine is not activated', async () => {
    // 1. Create a portal without search engine activation
    const portalConfig = {
      title: 'Portal without search',
      menu: { children: [] }
    }
    const portal = (await user1.post('/api/portals', { config: portalConfig })).data
    assert.equal(portal.config.searchEngine?.active, undefined)

    // 2. Add a page
    await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Secret Page',
        elements: [],
        genericMetadata: {
          slug: 'secret-page',
          description: 'This page should not be indexed'
        }
      },
      portals: [portal._id],
      owner: portal.owner
    })

    // 3. Query the search page indexes - should not have this page
    const { results: indexes } = (await user1.get('/api/search-page-indexes')).data
    const portalIndexes = indexes.filter((idx: any) => idx.portal === portal._id)
    assert.equal(portalIndexes.length, 0, 'Should not have indexed pages')
  })

  it('should automatically index pages when created', async () => {
    // Create portal with search engine
    const portalConfig = {
      title: 'Portal for reindex test',
      menu: { children: [] },
      searchEngine: {
        active: true,
        types: ['page']
      }
    }
    const portal = (await user1.post('/api/portals', { config: portalConfig })).data

    // Add a page - it should be automatically indexed on creation
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Page to reindex',
        elements: [],
        genericMetadata: { slug: 'page-to-reindex' }
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    // Verify page is indexed after creation
    const { results: indexes } = (await user1.get('/api/search-page-indexes')).data
    const portalIndexes = indexes.filter((idx: any) => idx.portal === portal._id)
    assert.ok(portalIndexes.length > 0, 'Page should be indexed after creation')
    assert.equal(portalIndexes[0].resource.id, createdPage._id)
  })
})
