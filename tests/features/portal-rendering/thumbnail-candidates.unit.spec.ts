import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import {
  applicationCaptureUrl,
  applicationThumbnailCandidates,
  datasetThumbnailCandidates,
  reuseThumbnailCandidates
} from '../../../portal/app/utils/thumbnail.ts'

const portalImageSrc = (ref: any) => `/portal/api/images/${ref._id}`
const pageImageSrc = (ref: any) => `/portal/api/pages/home/home/images/${ref._id}`
const reuseImageSrc = (ref: any) => `/portal/api/reuses/r1/images/${ref._id}`

const ref = (id: string) => ({ _id: id, name: `${id}.png`, mimeType: 'image/png' })
const topics = [{ id: 't1', title: 'Avec image', thumbnail: ref('topic-1') }, { id: 't2', title: 'Sans image' }]

const dsCandidates = (dataset: any, thumbnail: any) =>
  datasetThumbnailCandidates(dataset, { thumbnail } as any, topics as any, portalImageSrc, pageImageSrc)

test.describe('dataset thumbnail candidates', () => {
  test('follows the priority documented in the schema', () => {
    assert.deepEqual(
      dsCandidates(
        {
          image: 'https://img.test/own.png',
          topics: [{ id: 't1' }],
          extras: { applications: [{ id: 'app1', updatedAt: 'U' }] }
        },
        { show: true, useTopic: true, useApplication: true, default: ref('default-1') }
      ),
      [
        'https://img.test/own.png',
        '/portal/api/images/topic-1',
        applicationCaptureUrl('app1', 'U'),
        '/portal/api/pages/home/home/images/default-1'
      ]
    )
  })

  test('is empty when the thumbnail is turned off', () => {
    assert.deepEqual(
      dsCandidates({ image: 'https://img.test/own.png' }, { show: false, default: ref('default-1') }),
      []
    )
  })

  test('skips the topic and the capture when their options are off', () => {
    assert.deepEqual(
      dsCandidates(
        { topics: [{ id: 't1' }], extras: { applications: [{ id: 'app1', updatedAt: 'U' }] } },
        { show: true, default: ref('default-1') }
      ),
      ['/portal/api/pages/home/home/images/default-1']
    )
  })

  test('only considers the first topic, as the schema says', () => {
    assert.deepEqual(
      dsCandidates({ topics: [{ id: 't2' }, { id: 't1' }] }, { show: true, useTopic: true }),
      []
    )
  })

  test('only considers the first linked application, as the schema says', () => {
    assert.deepEqual(
      dsCandidates(
        { extras: { applications: [{ id: 'app1', updatedAt: 'U' }, { id: 'app2', updatedAt: 'V' }] } },
        { show: true, useApplication: true }
      ),
      [applicationCaptureUrl('app1', 'U')]
    )
  })

  test('tolerates a dataset with no topic and no linked application', () => {
    assert.deepEqual(
      dsCandidates({}, { show: true, useTopic: true, useApplication: true, default: ref('default-1') }),
      ['/portal/api/pages/home/home/images/default-1']
    )
  })

  test('drops duplicates so a source is never tried twice', () => {
    const same = '/portal/api/images/topic-1'
    assert.deepEqual(
      dsCandidates({ image: same, topics: [{ id: 't1' }] }, { show: true, useTopic: true }),
      [same]
    )
  })

  test('uses the portal image source for a portal-level card', () => {
    assert.deepEqual(
      datasetThumbnailCandidates({}, { thumbnail: { show: true, default: ref('default-1') } } as any, topics as any, portalImageSrc, portalImageSrc),
      ['/portal/api/images/default-1']
    )
  })
})

const appCandidates = (application: any, thumbnail: any) =>
  applicationThumbnailCandidates(
    { id: 'app1', updatedAt: 'U', ...application },
    { thumbnail } as any,
    topics as any,
    portalImageSrc
  )

test.describe('application thumbnail candidates', () => {
  test('follows image, topic then capture', () => {
    assert.deepEqual(
      appCandidates({ image: 'https://img.test/app.png', topics: [{ id: 't1' }] }, { show: true, useTopic: true }),
      ['https://img.test/app.png', '/portal/api/images/topic-1', applicationCaptureUrl('app1', 'U')]
    )
  })

  test('drops the capture when the summary takes its place', () => {
    assert.deepEqual(
      appCandidates({ summary: 'Un resume' }, { show: true, location: 'center', useSummary: true }),
      []
    )
  })

  test('keeps the capture when the summary is empty', () => {
    assert.deepEqual(
      appCandidates({ summary: '' }, { show: true, location: 'center', useSummary: true }),
      [applicationCaptureUrl('app1', 'U')]
    )
  })

  test('keeps the capture outside the center position', () => {
    assert.deepEqual(
      appCandidates({ summary: 'Un resume' }, { show: true, location: 'left', useSummary: true }),
      [applicationCaptureUrl('app1', 'U')]
    )
  })

  test('still offers its own image when the summary suppresses the capture', () => {
    assert.deepEqual(
      appCandidates({ image: 'https://img.test/app.png', summary: 'Un resume' }, { show: true, location: 'center', useSummary: true }),
      ['https://img.test/app.png']
    )
  })

  test('builds the capture url on the immutable id', () => {
    assert.equal(
      applicationCaptureUrl('abc', '2026-01-01T00:00:00.000Z'),
      '/data-fair/api/v1/applications/abc/capture?updatedAt=2026-01-01T00:00:00.000Z'
    )
  })
})

test.describe('reuse thumbnail candidates', () => {
  test('follows the reuse image then the default image', () => {
    assert.deepEqual(
      reuseThumbnailCandidates(ref('reuse-1'), { thumbnail: { show: true, default: ref('default-1') } } as any, reuseImageSrc, pageImageSrc),
      ['/portal/api/reuses/r1/images/reuse-1', '/portal/api/pages/home/home/images/default-1']
    )
  })

  test('falls back to the default image alone', () => {
    assert.deepEqual(
      reuseThumbnailCandidates(undefined, { thumbnail: { show: true, default: ref('default-1') } } as any, reuseImageSrc, pageImageSrc),
      ['/portal/api/pages/home/home/images/default-1']
    )
  })

  test('is empty when the thumbnail is turned off', () => {
    assert.deepEqual(
      reuseThumbnailCandidates(ref('reuse-1'), { thumbnail: { show: false } } as any, reuseImageSrc, pageImageSrc),
      []
    )
  })
})
