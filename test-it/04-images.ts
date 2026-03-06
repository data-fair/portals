import { strict as assert } from 'node:assert'
import { it, describe, before, beforeEach, after } from 'node:test'
import { createReadStream } from 'node:fs'
import FormData from 'form-data'
import 'dotenv/config'
import { clean, startApiServer, stopApiServer, axiosAuth } from './utils/index.ts'

const user1 = await axiosAuth('admin@test.com')

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

  it('should load a PNG and resize it', async () => {
    const page = (await user1.post('/api/pages', { type: 'home', config: { title: 'My page', elements: [] } })).data

    const form = new FormData()
    form.append('body', JSON.stringify({ resource: { type: 'page', _id: page._id } }))
    form.append('image', createReadStream('test-it/resources/logo.png'))
    const image = await user1.post('/api/images', form).then(r => r.data)
    assert.equal(image.width, 200)
    assert.equal(image.height, 200)
    assert.equal(image.name, 'logo.png')
    assert.equal(image.mimeType, 'image/webp')
  })

  it('should load a SVG and not resize it', async () => {
    const page = (await user1.post('/api/pages', { type: 'home', config: { title: 'My page', elements: [] } })).data

    const form = new FormData()
    form.append('body', JSON.stringify({ resource: { type: 'page', _id: page._id } }))
    form.append('image', createReadStream('test-it/resources/logo.svg'))
    const image = await user1.post('/api/images', form).then(r => r.data)
    assert.equal(image.width, 0)
    assert.equal(image.height, 0)
    assert.equal(image.name, 'logo.svg')
    assert.equal(image.mimeType, 'image/svg+xml')
  })

  it('should load an ICO (logo.ico) and convert it to WebP', async () => {
    const page = (await user1.post('/api/pages', { type: 'home', config: { title: 'My page', elements: [] } })).data

    const form = new FormData()
    form.append('body', JSON.stringify({ resource: { type: 'page', _id: page._id } }))
    form.append('image', createReadStream('test-it/resources/logo.ico'))
    const image = await user1.post('/api/images', form).then(r => r.data)
    assert(image.width > 0, 'width should be positive')
    assert(image.height > 0, 'height should be positive')
    assert.equal(image.name, 'logo.ico')
    assert.equal(image.mimeType, 'image/webp')
  })

  it('should load another ICO (logo2.ico) and convert it to WebP', async () => {
    const page = (await user1.post('/api/pages', { type: 'home', config: { title: 'My page', elements: [] } })).data

    const form = new FormData()
    form.append('body', JSON.stringify({ resource: { type: 'page', _id: page._id } }))
    form.append('image', createReadStream('test-it/resources/logo2.ico'))
    const image = await user1.post('/api/images', form).then(r => r.data)
    assert(image.width > 0, 'width should be positive')
    assert(image.height > 0, 'height should be positive')
    assert.equal(image.name, 'logo2.ico')
    assert.equal(image.mimeType, 'image/webp')
  })
})
