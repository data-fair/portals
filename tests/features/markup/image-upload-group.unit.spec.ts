import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { tagDescriptors } from '../../../shared/markup/tag-descriptors.ts'

test.describe('image-upload groups in tag descriptors', () => {
  test('<image> element exposes image and wideImage groups', () => {
    const desc = tagDescriptors.image
    assert.ok(desc, 'image descriptor exists')
    const groups = desc.imageUploadGroups ?? []
    const paths = groups.map(g => g.jsonPath.join('.'))
    assert.ok(paths.includes('image'), `expected "image" group, got ${JSON.stringify(paths)}`)
    assert.ok(paths.includes('wideImage'), `expected "wideImage" group, got ${JSON.stringify(paths)}`)
  })

  test('image-upload group carries slot props', () => {
    const desc = tagDescriptors.image
    const image = (desc.imageUploadGroups ?? []).find(g => g.jsonPath.join('.') === 'image')
    assert.ok(image, 'image group present')
    assert.equal(image!.width, 2400)
    assert.equal(image!.label, 'Chargez une image')
  })

  test('banner element exposes background.image group', () => {
    const desc = tagDescriptors.banner
    assert.ok(desc, 'banner descriptor exists')
    const paths = (desc.imageUploadGroups ?? []).map(g => g.jsonPath.join('.'))
    assert.ok(paths.includes('background.image'), `expected "background.image" on banner, got ${JSON.stringify(paths)}`)
  })

  test('card element exposes both background.image and thumbnail.image', () => {
    const desc = tagDescriptors.card
    assert.ok(desc, 'card descriptor exists')
    const paths = (desc.imageUploadGroups ?? []).map(g => g.jsonPath.join('.'))
    assert.ok(paths.includes('background.image'), `card missing background.image: ${JSON.stringify(paths)}`)
    assert.ok(paths.includes('thumbnail.image'), `card missing thumbnail.image: ${JSON.stringify(paths)}`)
  })

  test('datasets-list exposes cardConfig.thumbnail.default as a deep group', () => {
    const desc = tagDescriptors['datasets-list']
    assert.ok(desc, 'datasets-list descriptor exists')
    const paths = (desc.imageUploadGroups ?? []).map(g => g.jsonPath.join('.'))
    assert.ok(
      paths.includes('cardConfig.thumbnail.default'),
      `datasets-list missing cardConfig.thumbnail.default: ${JSON.stringify(paths)}`
    )
  })
})
