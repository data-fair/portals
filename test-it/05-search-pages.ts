import { strict as assert } from 'node:assert'
import { it, describe, before, beforeEach, after } from 'node:test'
import { WsClient } from '@data-fair/lib-node/ws-client.js'
import 'dotenv/config'
import { clean, startApiServer, stopApiServer, axiosAuth, baseURL } from './utils/index.ts'

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
    const { results: indexes } = (await user1.get('/api/search-pages')).data
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
    const { results: indexes } = (await user1.get('/api/search-pages')).data
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
    const { results: indexes } = (await user1.get('/api/search-pages')).data
    const portalIndexes = indexes.filter((idx: any) => idx.portal === portal._id)
    assert.ok(portalIndexes.length > 0, 'Page should be indexed after creation')
    assert.equal(portalIndexes[0].resource.id, createdPage._id)
  })

  it('should receive realtime updates when page is indexed', async () => {
    // 1. Create a portal with search engine
    const portalConfig = {
      title: 'Portal for realtime test',
      menu: { children: [] },
      searchEngine: {
        active: true,
        types: ['page']
      }
    }
    const portal = (await user1.post('/api/portals', { config: portalConfig })).data

    // 2. Connect to websocket as authenticated user
    const wsClient = new WsClient({
      url: baseURL.replace('portals-manager', 'portals-manager').replace('http', 'ws') + '/api/',
      headers: { Cookie: user1.defaults.headers.Cookie as string }
    })

    // 3. Subscribe to the search-pages channel for this portal
    await wsClient.subscribe(`search-pages/${portal._id}`)

    // 4. Create a page - it will be indexed by the worker
    const page = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Realtime Page',
        elements: [],
        genericMetadata: { slug: 'realtime-page' }
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    // 5. Wait for the websocket event
    const message = await wsClient.waitFor(
      `search-pages/${portal._id}`,
      (msg: any) => msg.data?._id?.includes(page._id),
      30000
    )

    assert.ok(message, 'Should receive websocket event')
    assert.equal(message.data.indexingStatus, 'ok', 'Indexed status should be ok')

    wsClient.close()
  })

  it('should not allow unauthorized websocket subscriptions', async () => {
    // Create a portal with search engine
    const portalConfig = {
      title: 'Portal for auth test',
      menu: { children: [] },
      searchEngine: {
        active: true,
        types: ['page']
      }
    }
    const portal = (await user1.post('/api/portals', { config: portalConfig })).data

    // Try to connect without authentication
    const anonClient = new WsClient({
      url: baseURL.replace('portals-manager', 'portals-manager').replace('http', 'ws') + '/api/'
    })

    try {
      await anonClient.subscribe(`search-pages/${portal._id}`)
      assert.fail('Should not be able to subscribe without auth')
    } catch (err: any) {
      assert.ok(err.message.includes('not authorized') || err.status === 401, 'Should receive authorization error')
    } finally {
      anonClient.close()
    }
  })
})
