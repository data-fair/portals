const assert = require('assert').strict
const fs = require('fs-extra')
const FormData = require('form-data')

describe('Uses API', () => {
  it('Create a portal and manage uses', async () => {
    const portal = (await global.ax.admin2Org.post('/api/v1/portals')).data
    assert.equal(portal.owner.type, 'organization')
    assert.equal(portal.owner.id, 'orga2')

    // create a use in the user's personal space
    const ax = global.ax.user1
    const use = (await ax.post(`/api/v1/portals/${portal._id}/uses`, { title: 'use 1', author: 'Test', datasets: [{ id: 'test' }] })).data
    assert.equal(use.portal._id, portal._id)
    assert.deepEqual(use.portal.owner, portal.owner)
    // at first the user is the owner
    assert.equal(use.owner.type, 'user')
    assert.equal(use.owner.id, 'user1')
    // the use is not yet listed for normal portal users
    let uses = (await global.ax.anonymous.get(`/api/v1/portals/${portal._id}/uses`)).data
    assert.equal(uses.count, 0)
    // the use is not yet listed for portal admins
    uses = (await global.ax.admin2Org.get(`/api/v1/portals/${portal._id}/uses`, { params: { published: false } })).data
    assert.equal(uses.count, 0)
    // the use is listed in owner's drafts
    uses = (await ax.get(`/api/v1/portals/${portal._id}/uses`, { params: { owner: 'me' } })).data
    assert.equal(uses.count, 1)
    // the user can patch the use
    await ax.patch(`/api/v1/portals/${portal._id}/uses/${use._id}`, { title: 'Use 1 title 2' })
    uses = (await ax.get(`/api/v1/portals/${portal._id}/uses`, { params: { owner: 'me' } })).data
    assert.equal(uses.results[0].title, 'Use 1 title 2')
    // but he cannot patch sensitive info like the owner
    await assert.rejects(ax.patch(`/api/v1/portals/${portal._id}/uses/${use._id}`, { owner: portal.owner }), err => err.status === 400)

    // when he is done with his draft the user can submit the use
    await ax.post(`/api/v1/portals/${portal._id}/uses/${use._id}/_submit`)
    // the use is no longer listed in owner's drafts
    uses = (await ax.get(`/api/v1/portals/${portal._id}/uses`, { params: { owner: 'me' } })).data
    assert.equal(uses.count, 0)
    // but it is listed in his submitted uses
    uses = (await ax.get(`/api/v1/portals/${portal._id}/uses`, { params: { creator: 'me' } })).data
    assert.equal(uses.count, 1)
    // the use is not yet listed for normal portal users
    uses = (await global.ax.anonymous.get(`/api/v1/portals/${portal._id}/uses`)).data
    assert.equal(uses.count, 0)
    // but it is listed for portal admins
    uses = (await global.ax.admin2Org.get(`/api/v1/portals/${portal._id}/uses`, { params: { published: false } })).data
    assert.equal(uses.count, 1)
    // the admin can patch the use
    await global.ax.admin2Org.patch(`/api/v1/portals/${portal._id}/uses/${use._id}`, { title: 'Use 1 title 3' })
    uses = (await ax.get(`/api/v1/portals/${portal._id}/uses`, { params: { creator: 'me' } })).data
    assert.equal(uses.results[0].title, 'Use 1 title 3')

    // the admin can publish the use
    await global.ax.admin2Org.patch(`/api/v1/portals/${portal._id}/uses/${use._id}`, { published: true })
    // at this point the use is listed for normal portal users
    uses = (await global.ax.anonymous.get(`/api/v1/portals/${portal._id}/uses`)).data
    assert.equal(uses.count, 1)
    assert.equal(uses.results[0].slug, 'use-1-title-3')
  })

  it('Create use with image', async () => {
    const portal = (await global.ax.admin2Org.post('/api/v1/portals')).data

    const ax = global.ax.user1
    const form = new FormData()
    form.append('image', fs.readFileSync('./public/static/logo.png'), 'logo.png')
    form.append('body', JSON.stringify({ title: 'Title in multipart form data', author: 'Test', datasets: [{ id: 'test' }] }), { contentType: 'application/json' })
    let use = (await ax.post(`/api/v1/portals/${portal._id}/uses`, form, { headers: { 'Content-Length': form.getLengthSync(), ...form.getHeaders() } })).data
    assert.equal(use.title, 'Title in multipart form data')
    assert.equal(use.image.name, 'logo.png')
    assert.equal(use.image.type, 'image/png')
    let imageRes = await ax.get(`/api/v1/portals/${portal._id}/uses/${use._id}/image`)
    assert.equal(imageRes.headers['content-type'], 'image/png')
    const thumbnailRes = await ax.get(`/api/v1/portals/${portal._id}/uses/${use._id}/image-thumbnail`)
    assert.equal(thumbnailRes.headers['content-type'], 'image/png')
    assert.ok(thumbnailRes.headers['content-length'] < imageRes.headers['content-length'])

    const form2 = new FormData()
    form2.append('image', fs.readFileSync('./public/static/logo.png'), 'logo.jpg')
    form2.append('body', JSON.stringify({ title: 'Patched title in multipart form data' }), { contentType: 'application/json' })
    await ax.patch(`/api/v1/portals/${portal._id}/uses/${use._id}`, form2, { headers: { 'Content-Length': form2.getLengthSync(), ...form2.getHeaders() } })
    use = (await ax.get(`/api/v1/portals/${portal._id}/uses/${use._id}`)).data
    assert.equal(use.image.name, 'logo.jpg')
    assert.equal(use.image.type, 'image/jpeg')
    imageRes = await ax.get(`/api/v1/portals/${portal._id}/uses/${use._id}/image`)
    assert.equal(imageRes.headers['content-type'], 'image/jpeg')
  })
})
