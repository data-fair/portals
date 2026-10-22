import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import type { PageConfig } from '../../../api/types/page/index.ts'
import { resolvePageAnchors } from '../../../api/src/pages/operations.ts'

const title = (content: string, anchor?: Record<string, any>, titleSize = 'h2') => ({ type: 'title', titleSize, content, anchor })
const pageConfig = (elements: any[]) => ({ title: 'P', elements }) as PageConfig
const slugs = (config: PageConfig) => config.elements.map((e: any) => e.anchor?._slug)

test.describe('resolvePageAnchors', () => {
  test('generates the slug from the title content', async () => {
    const config = pageConfig([title('Mon Ancre', { enabled: true })])
    await resolvePageAnchors(config)
    assert.deepEqual(slugs(config), ['mon-ancre'])
  })

  test('deduplicates the slugs in document order', async () => {
    const config = pageConfig([title('Intro', { enabled: true }), title('Intro', { enabled: true })])
    await resolvePageAnchors(config)
    assert.deepEqual(slugs(config), ['intro', 'intro-2'])
  })

  test('a disabled anchor gets no slug, and loses a stale one', async () => {
    const config = pageConfig([title('Plain', { enabled: false, _slug: 'stale' })])
    await resolvePageAnchors(config)
    assert.deepEqual(slugs(config), [undefined])
  })

  test('builds the table of contents from anchored titles, including nested ones, in order', async () => {
    const toc = await resolvePageAnchors(pageConfig([
      title('Introduction', { enabled: true, inToc: true }),
      // an anchored title is not added to the table of contents when inToc is off
      title('Anchor without toc', { enabled: true, inToc: false }, 'h3'),
      title('No anchor', undefined, 'h3'),
      {
        type: 'two-columns',
        disposition: 'equal',
        gutter: 'default',
        children: [title('In a column', { enabled: true, inToc: true }, 'h4')],
        children2: [{ type: 'text', content: 'lorem' }]
      },
      // the label overrides the displayed title in the table of contents
      title('Conclusion', { enabled: true, inToc: true, label: 'The end' })
    ]))
    assert.deepEqual(toc, [
      { id: 'introduction', title: 'Introduction' },
      { id: 'in-a-column', title: 'In a column' },
      { id: 'conclusion', title: 'The end' }
    ])
  })
})
