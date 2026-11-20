import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import type { Page } from '../../../api/types/page/index.ts'
import { pagePath } from '../../../api/src/pages/operations.ts'

const page = (type: Page['type'], config: Record<string, any>, draftConfig?: Record<string, any>) =>
  ({ _id: 'p1', type, config: { title: 'T', elements: [], ...config }, draftConfig: draftConfig && { title: 'T', elements: [], ...draftConfig } }) as unknown as Page

test.describe('pagePath', () => {
  test('a standard page has a fixed path', () => {
    assert.equal(pagePath(page('home', {})), '/')
    assert.equal(pagePath(page('contact', {})), '/contact')
    assert.equal(pagePath(page('event-catalog', {})), '/event')
    assert.equal(pagePath(page('legal-notice', {})), '/legal-notice')
  })

  test('a generic page is under its group', () => {
    const group = { _id: 'g1', title: 'Guides', slug: 'guides' }
    assert.equal(pagePath(page('generic', { genericMetadata: { slug: 'intro', group } })), '/pages-guides/intro')
    assert.equal(pagePath(page('generic', { genericMetadata: { slug: 'intro' } })), '/pages/intro')
  })

  test('the path reads the published configuration, not the draft', () => {
    const published = page('news', { newsMetadata: { slug: 'old-slug' } }, { newsMetadata: { slug: 'new-slug' } })
    assert.equal(pagePath(published), '/news/old-slug')
  })
})
