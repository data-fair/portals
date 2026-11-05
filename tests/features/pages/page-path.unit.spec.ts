import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import type { Page } from '../../../api/types/page/index.ts'
import { pagePath } from '../../../api/src/pages/operations.ts'

const page = (type: Page['type'], config: Record<string, any>, draftConfig?: Record<string, any>) =>
  ({ _id: 'p1', type, config: { title: 'T', elements: [], ...config }, draftConfig: draftConfig && { title: 'T', elements: [], ...draftConfig } }) as unknown as Page

test.describe('pagePath', () => {
  test('a standard page has a fixed path', () => {
    assert.equal(pagePath(page('home', {}), false), '/')
    assert.equal(pagePath(page('contact', {}), true), '/contact')
    assert.equal(pagePath(page('event-catalog', {}), false), '/event')
    assert.equal(pagePath(page('legal-notice', {}), false), '/legal-notice')
  })

  test('a generic page is under its group', () => {
    const group = { _id: 'g1', title: 'Guides', slug: 'guides' }
    assert.equal(pagePath(page('generic', { genericMetadata: { slug: 'intro', group } }), false), '/pages-guides/intro')
    assert.equal(pagePath(page('generic', { genericMetadata: { slug: 'intro' } }), false), '/pages/intro')
  })

  test('the draft host reads the slug and the group of the draft', () => {
    const published = page('news', { newsMetadata: { slug: 'old-slug' } }, { newsMetadata: { slug: 'new-slug' } })
    assert.equal(pagePath(published, false), '/news/old-slug')
    assert.equal(pagePath(published, true), '/news/new-slug')
    const group = { _id: 'g1', title: 'Guides', slug: 'guides' }
    const generic = page('generic', { genericMetadata: { slug: 'a' } }, { genericMetadata: { slug: 'a', group } })
    assert.equal(pagePath(generic, false), '/pages/a')
    assert.equal(pagePath(generic, true), '/pages-guides/a')
  })

  test('a page without draft falls back on its published config', () => {
    assert.equal(pagePath(page('event', { eventMetadata: { slug: 'fete' } }), true), '/event/fete')
  })
})
