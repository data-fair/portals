import type { PageConfig, ImageElement } from '../api/types/page-config/index.ts'
import { strict as assert } from 'node:assert'
import { it, describe, before, beforeEach, after } from 'node:test'
import { createReadStream } from 'node:fs'
import FormData from 'form-data'
import { clean, startApiServer, stopApiServer, axiosAuth } from './utils/index.ts'

const user1 = await axiosAuth('admin@test.com')

describe('pages management', () => {
  before(startApiServer)
  beforeEach(clean)
  after(stopApiServer)

  it('should create a page', async () => {
    const pageConfig = { title: 'My page', elements: [] }
    const page = (await user1.post('/api/pages', { type: 'home', config: pageConfig })).data
    assert.equal(page.owner.id, 'adminOrga')
    assert.deepEqual(page.config, pageConfig)
    assert.deepEqual(page.draftConfig, pageConfig)
  })

  it('should duplicate a page with an image', async () => {
    const sourcePageConfig: PageConfig = {
      title: 'Source page',
      elements: []
    }
    const sourcePage = (await user1.post('/api/pages', { type: 'home', config: sourcePageConfig })).data

    // Upload an image for the source page
    const form = new FormData()
    form.append('body', JSON.stringify({ resource: { type: 'page', _id: sourcePage._id } }))
    form.append('image', createReadStream('test-it/resources/logo.png'))
    const sourceImage = await user1.post('/api/images', form).then(r => r.data)

    // Add image element to the source page
    const imageElement: ImageElement = {
      type: 'image',
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

    assert.equal(duplicatedPage.owner.id, 'adminOrga')
    assert.equal(duplicatedPage.config.title, 'Duplicated page')
    assert.equal(duplicatedPage.config.elements.length, 1, 'Duplicated page should have one element')
    assert.equal(duplicatedPage.config.elements[0].type, 'image')

    // Check that the image was duplicated with a new ID
    const duplicatedImageId = duplicatedPage.config.elements[0].image._id
    assert.notEqual(duplicatedImageId, sourceImage._id, 'Image should have a new ID')

    // Verify the duplicated image exists in database
    const duplicatedImageData = await user1.get(`/api/images/${duplicatedImageId}/data`)
    assert.equal(duplicatedImageData.status, 200, 'Duplicated image should be accessible')
  })
})
