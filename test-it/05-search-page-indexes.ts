import { strict as assert } from 'node:assert'
import { it, describe, before, beforeEach, after } from 'node:test'
import { clean, startApiServer, stopApiServer, axiosAuth, baseURL, axios } from './utils/index.ts'

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
    const indexes = (await user1.get('/api/search-page-indexes')).data
    assert.ok(Array.isArray(indexes))

    const portalIndexes = indexes.filter((idx: any) => idx.portalId === portal._id)
    assert.ok(portalIndexes.length > 0, 'Should have at least one indexed page')

    const indexedPage = portalIndexes.find((idx: any) => idx.pageId === page._id)
    assert.ok(indexedPage, 'Page should be indexed')
    assert.equal(indexedPage.title, 'Test Page')
    assert.ok(indexedPage.description?.includes('test'), 'Description should be indexed')

    // 4. Query the portal's search engine
    const searchResults = (await axios({
      baseURL: `http://localhost:5610/portals/${portal._id}`,
      url: '/api/search',
      params: { q: 'test' }
    })).data
    assert.ok(Array.isArray(searchResults))

    const foundPage = searchResults.find((r: any) => r.page?._id === page._id)
    assert.ok(foundPage, 'Should find the indexed page in search results')
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
    const indexes = (await user1.get('/api/search-page-indexes')).data
    const portalIndexes = indexes.filter((idx: any) => idx.portalId === portal._id)
    assert.equal(portalIndexes.length, 0, 'Should not have indexed pages')
  })

  it('should reindex pages via webhook', async () => {
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

    // Add a page
    await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Page to reindex',
        elements: [],
        genericMetadata: { slug: 'page-to-reindex' }
      },
      portals: [portal._id],
      owner: portal.owner
    })

    // Trigger reindex via webhook
    await axios({
      method: 'post',
      url: `${baseURL}/api/search-page-indexes/reindex`,
      params: { key: 'secret-identities' },
      data: { portalId: portal._id }
    })

    // Verify page is indexed
    const indexes = (await user1.get('/api/search-page-indexes')).data
    const portalIndexes = indexes.filter((idx: any) => idx.portalId === portal._id)
    assert.ok(portalIndexes.length > 0, 'Page should be indexed after reindex')
  })
})
