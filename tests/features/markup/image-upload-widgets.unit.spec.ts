import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'
import { tagDescriptors } from '../../../shared/markup/tag-descriptors.ts'
import { computeImageUploadRanges } from '../../../shared/markup/codemirror/image-upload-widgets.ts'

test.describe('image-upload widget range computation', () => {
  test('detects a contiguous image group and returns its span', () => {
    const src = '<image image._id="abc" image.name="photo.jpg" image.mimeType="image/jpeg" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    assert.equal(ranges.length, 1, `expected one range, got ${ranges.length}`)
    const [r] = ranges
    assert.equal(r.elementPointer, '/0')
    assert.equal(r.group.jsonPath.join('.'), 'image')
    // The range should cover the attribute text.
    const covered = src.slice(r.from, r.to)
    assert.ok(covered.includes('image._id'))
    assert.ok(covered.includes('image.mimeType'))
  })

  test('returns no range when attributes are interleaved with unrelated ones', () => {
    const src = '<image image._id="abc" banner="true" image.name="photo.jpg" image.mimeType="image/jpeg" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    assert.equal(ranges.length, 0, 'interleaved attrs should skip the group')
  })

  test('returns no range when not all required leaf attributes are present', () => {
    const src = '<image image._id="abc" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    assert.equal(ranges.length, 0, 'missing leaves should skip the group')
  })

  test('handles two groups on the same element (image and wideImage)', () => {
    const src = [
      '<image',
      '  image._id="a" image.name="a.jpg" image.mimeType="image/jpeg"',
      '  wideImage._id="b" wideImage.name="b.jpg" wideImage.mimeType="image/jpeg"',
      '/>'
    ].join('\n')
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    const paths = ranges.map(r => r.group.jsonPath.join('.')).sort()
    assert.deepEqual(paths, ['image', 'wideImage'])
  })

  test('ignores tags without image-upload groups', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    assert.equal(ranges.length, 0)
  })
})
