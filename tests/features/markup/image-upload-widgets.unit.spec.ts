import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'
import { tagDescriptors } from '../../../shared/markup/tag-descriptors.ts'
import {
  computeImageUploadRanges,
  contiguousGroupSpan
} from '../../../shared/markup/codemirror/image-upload-widgets.ts'

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

  test('inserts point widgets for every empty image-upload group on a bare tag', () => {
    const src = '<image />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    // Both `image` and `wideImage` groups on <image> are empty ⇒ two point
    // widgets at distinct positions inside the tag.
    assert.equal(ranges.length, 2)
    for (const r of ranges) {
      assert.equal(r.from, r.to, 'bare-tag widgets are point decorations')
      assert.ok(r.from > 0 && r.from < src.length, 'within the tag')
    }
    const paths = ranges.map(r => r.group.jsonPath.join('.')).sort()
    assert.deepEqual(paths, ['image', 'wideImage'])
  })

  test('does not insert bare-tag widgets when any image-upload attr is present', () => {
    // wideImage is empty, but `image` has a partial attr — the tag is not bare.
    const src = '<image image._id="abc" />'
    const { sourceMap } = deserializeElements(src)
    const ranges = computeImageUploadRanges(src, sourceMap, tagDescriptors)
    assert.equal(ranges.length, 0)
  })
})

test.describe('contiguousGroupSpan (pure helper)', () => {
  const prefix = ['image']
  // Build attribute ranges by hand so tests don't depend on the deserializer.
  const makeAttr = (doc: string, name: string): { path: string[], from: number, to: number } => {
    const match = new RegExp(`${name.replace('.', '\\.')}="([^"]*)"`).exec(doc)
    if (!match) throw new Error(`attr ${name} not found in ${doc}`)
    const valFrom = match.index + match[0].indexOf('"') + 1
    const valTo = valFrom + match[1].length
    return { path: name.split('.'), from: valFrom, to: valTo }
  }

  test('returns span covering all in-group attrs when required leaves present', () => {
    const doc = '<image image._id="a" image.name="b" image.mimeType="c" />'
    const inGroup = ['image._id', 'image.name', 'image.mimeType'].map(n => makeAttr(doc, n))
    const span = contiguousGroupSpan(doc, inGroup, [], prefix)
    assert.ok(span)
    assert.ok(doc.slice(span.from, span.to).includes('image._id'))
    assert.ok(doc.slice(span.from, span.to).includes('image.mimeType'))
  })

  test('returns null when a required leaf is missing', () => {
    const doc = '<image image._id="a" image.name="b" />'
    const inGroup = ['image._id', 'image.name'].map(n => makeAttr(doc, n))
    assert.equal(contiguousGroupSpan(doc, inGroup, [], prefix), null)
  })

  test('returns null when an outside-group attr falls inside the span', () => {
    const doc = '<image image._id="a" banner="true" image.name="b" image.mimeType="c" />'
    const inGroup = ['image._id', 'image.name', 'image.mimeType'].map(n => makeAttr(doc, n))
    const outsideGroup = [makeAttr(doc, 'banner')]
    assert.equal(contiguousGroupSpan(doc, inGroup, outsideGroup, prefix), null)
  })

  test('ignores outside-group attrs that sit outside the span', () => {
    const doc = '<image banner="true" image._id="a" image.name="b" image.mimeType="c" />'
    const inGroup = ['image._id', 'image.name', 'image.mimeType'].map(n => makeAttr(doc, n))
    const outsideGroup = [makeAttr(doc, 'banner')]
    const span = contiguousGroupSpan(doc, inGroup, outsideGroup, prefix)
    assert.ok(span)
    // banner is before the group, not inside it.
    assert.ok(span.from > doc.indexOf('banner'))
  })
})
