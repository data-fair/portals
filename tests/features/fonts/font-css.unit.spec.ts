import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { makeFontCss } from '../../../api/src/fonts/operations.ts'

const ranges = (css: string) => [...css.matchAll(/unicode-range: (.*);/g)].map(m => m[1])

test.describe('font css', () => {
  test('a latin-ext file alone also covers the basic latin letters', () => {
    const css = makeFontCss({ name: 'Custom', variants: [{ subset: 'latin-ext', style: 'normal', weightRange: '400 700', woff2Url: '/custom.woff2' }] })
    const [range] = ranges(css)
    assert.ok(range.startsWith('U+0000-00FF'))
    assert.ok(range.includes('U+0100-02AF'))
  })

  test('a latin-ext file next to a latin one keeps its own range', () => {
    const css = makeFontCss({
      name: 'Split',
      variants: [
        { subset: 'latin', style: 'normal', weightRange: '400', woff2Url: '/latin.woff2' },
        { subset: 'latin-ext', style: 'normal', weightRange: '400', woff2Url: '/latin-ext.woff2' },
        { subset: 'latin-ext', style: 'italic', weightRange: '400', woff2Url: '/latin-ext-italic.woff2' }
      ]
    })
    const [latin, latinExt, italicExt] = ranges(css)
    assert.ok(latin.startsWith('U+0000-00FF'))
    assert.ok(latinExt.startsWith('U+0100-02AF'))
    assert.ok(italicExt.startsWith('U+0000-00FF'))
  })
})
