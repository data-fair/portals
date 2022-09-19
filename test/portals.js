const assert = require('assert').strict
const event2promise = require('event-to-promise')

describe('Portals API', () => {
  it('Create a portal and synchronize it to data-fair', async () => {
    const ax = global.ax.user1
    const publicationSitePromise = event2promise(global.events, 'publicationSite')
    const portal = (await ax.post('/api/v1/portals')).data
    const publicationSite = await publicationSitePromise
    assert.equal(portal._id, publicationSite.id)
    assert.equal(publicationSite.type, 'data-fair-portals')
  })
})
