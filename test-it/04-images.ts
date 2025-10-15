import { strict as assert } from 'node:assert'
import { it, describe, before, beforeEach, after } from 'node:test'
import { createReadStream } from 'node:fs'
import FormData from 'form-data'
import { clean, startApiServer, stopApiServer, axiosAuth } from './utils/index.ts'

const user1 = await axiosAuth('user1@test.com')

describe('images management', () => {
  before(startApiServer)
  beforeEach(clean)
  after(stopApiServer)

  it('should fail to load an image on an unknown resource', async () => {
    const form = new FormData()
    form.append('body', JSON.stringify({ resource: { type: 'page', _id: 'unknown' } }))
    form.append('image', createReadStream('test-it/resources/logo.svg'))
    await assert.rejects(user1.post('/api/images', form), { status: 404 })
  })

  it('should load an image on a page', async () => {
    const page = (await user1.post('/api/pages', { type: 'home', config: { title: 'My page', elements: [] } })).data

    const form = new FormData()
    form.append('body', JSON.stringify({ resource: { type: 'page', _id: page._id } }))
    form.append('image', createReadStream('test-it/resources/logo.svg'))
    const image = await user1.post('/api/images', form).then(r => r.data)
    assert.equal(image.width, 200)
    assert.equal(image.height, 200)
    assert.equal(image.name, 'logo.svg')
    assert.equal(image.mimeType, 'image/png')
  })
})
