import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'
import { tagDescriptors } from '../../../shared/markup/tag-descriptors.ts'
import { computeImageUploadRanges } from '../../../shared/markup/codemirror/image-upload-widgets.ts'

test.describe('image-upload widget range computation', () => {
  test('emits a widget range on _id and hide ranges on name/mimeType when all three are present', () => {
    const src = '<image image._id="abc" image.name="photo.jpg" image.mimeType="image/jpeg" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)

    const imageGroup = ranges.filter(r => r.group.jsonPath.join('.') === 'image')
    assert.equal(imageGroup.length, 3, 'one widget + two hides for the image group')

    const widgetRanges = imageGroup.filter(r => r.kind === 'widget')
    const hideRanges = imageGroup.filter(r => r.kind === 'hide')
    assert.equal(widgetRanges.length, 1)
    assert.equal(hideRanges.length, 2)

    const covered = src.slice(widgetRanges[0].from, widgetRanges[0].to)
    assert.ok(covered.includes('image._id'), `widget range should cover the _id attribute, got: ${covered}`)

    const hiddenTexts = hideRanges.map(r => src.slice(r.from, r.to)).sort()
    assert.match(hiddenTexts[0], /image\.mimeType=/)
    assert.match(hiddenTexts[1], /image\.name=/)
  })

  test('tolerates interleaved attributes (no contiguity requirement)', () => {
    const src = '<image image._id="abc" banner="true" image.name="photo.jpg" image.mimeType="image/jpeg" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)

    const imageGroup = ranges.filter(r => r.group.jsonPath.join('.') === 'image')
    assert.equal(imageGroup.length, 3, 'interleaving no longer suppresses the widget')
    assert.equal(imageGroup.filter(r => r.kind === 'widget').length, 1)
    assert.equal(imageGroup.filter(r => r.kind === 'hide').length, 2)

    // banner range is NOT among the hide ranges
    const hideCovered = imageGroup.filter(r => r.kind === 'hide').map(r => src.slice(r.from, r.to)).join('|')
    assert.ok(!hideCovered.includes('banner'))
  })

  test('emits the widget even when only _id is present (partial state, no hides needed)', () => {
    const src = '<image image._id="abc" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    const imageGroup = ranges.filter(r => r.group.jsonPath.join('.') === 'image')
    assert.equal(imageGroup.filter(r => r.kind === 'widget').length, 1)
    assert.equal(imageGroup.filter(r => r.kind === 'hide').length, 0)
  })

  test('hides name/mimeType even when _id is absent but widget is not emitted (avoid showing orphan attrs)', () => {
    // This matches the "partial state where user forgot _id" case. The widget
    // falls back to the point-upload affordance ONLY when the whole group is
    // empty; a partial state shows no widget but still hides the stray attrs.
    const src = '<image image.name="photo.jpg" image.mimeType="image/jpeg" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    const imageGroup = ranges.filter(r => r.group.jsonPath.join('.') === 'image')
    // No widget (no _id), no point widget (group is not bare), but two hide ranges.
    assert.equal(imageGroup.filter(r => r.kind === 'widget').length, 0)
    assert.equal(imageGroup.filter(r => r.kind === 'point').length, 0)
    assert.equal(imageGroup.filter(r => r.kind === 'hide').length, 2)
  })

  test('emits a point widget for each empty image-upload group on a bare tag', () => {
    const src = '<image />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    const points = ranges.filter(r => r.kind === 'point')
    assert.equal(points.length, 2, 'image + wideImage groups each contribute a point widget')
    for (const r of points) {
      assert.equal(r.from, r.to, 'point widgets are zero-width')
    }
    const paths = points.map(r => r.group.jsonPath.join('.')).sort()
    assert.deepEqual(paths, ['image', 'wideImage'])
  })

  test('ignores tags without image-upload groups', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    assert.equal(ranges.length, 0)
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
    const widgetPaths = ranges.filter(r => r.kind === 'widget').map(r => r.group.jsonPath.join('.')).sort()
    assert.deepEqual(widgetPaths, ['image', 'wideImage'])
    assert.equal(ranges.filter(r => r.kind === 'hide').length, 4, '2 groups × 2 hidden leaves')
  })
})
