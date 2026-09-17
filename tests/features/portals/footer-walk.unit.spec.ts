import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { forEachFooterBlock, hasKoumoulMention, footerImageRefs, footerLinkItems } from '../../../api/types/portal-config-footer/walk.ts'
import type { Footer } from '../../../api/types/portal-config-footer/index.ts'

const backgroundImage = { _id: 'bg', name: 'bg.png', mimeType: 'image/png' }
const rowImage = { _id: 'row', name: 'row.png', mimeType: 'image/png' }
const itemImage = { _id: 'item', name: 'item.png', mimeType: 'image/png' }
const itemImageDark = { _id: 'item-dark', name: 'item-dark.png', mimeType: 'image/png' }

const footer: Footer = {
  copyright: false,
  background: { color: 'primary', image: backgroundImage },
  rows: [
    {
      background: { color: 'secondary', image: rowImage },
      columns: [
        {
          width: 'auto',
          blocks: [
            { type: 'images', align: 'center', height: 40, items: [{ source: 'upload', image: itemImage, imageDark: itemImageDark }] },
            { type: 'links', align: 'center', display: 'inline', items: [{ type: 'standard', subtype: 'sitemap' }] },
            { type: 'buttons', align: 'center', variant: 'flat', items: [{ type: 'external', href: '/foo', title: 'Foo' }] }
          ]
        }
      ]
    }
  ]
}

test.describe('forEachFooterBlock', () => {
  test('iterates over every block of every row and column', () => {
    const types: string[] = []
    forEachFooterBlock(footer, (block) => types.push(block.type))
    assert.deepEqual(types, ['images', 'links', 'buttons'])
  })

  test('does nothing on an undefined footer', () => {
    const types: string[] = []
    forEachFooterBlock(undefined, (block) => types.push(block.type))
    assert.deepEqual(types, [])
  })
})

test.describe('hasKoumoulMention', () => {
  test('is true when copyright is shown', () => {
    assert.equal(hasKoumoulMention({ ...footer, copyright: true }), true)
  })

  test('is true on an undefined footer', () => {
    assert.equal(hasKoumoulMention(undefined), true)
  })

  test('is true when an images block has a koumoul source item', () => {
    const withKoumoulLogo: Footer = {
      ...footer,
      rows: [{
        columns: [{
          width: 'auto',
          blocks: [{ type: 'images', align: 'center', height: 40, items: [{ source: 'koumoul' }] }]
        }]
      }]
    }
    assert.equal(hasKoumoulMention(withKoumoulLogo), true)
  })

  test('is false when copyright is hidden and no images block has a koumoul source item', () => {
    assert.equal(hasKoumoulMention(footer), false)
  })
})

test.describe('footerImageRefs', () => {
  test('collects background, row background and images block refs', () => {
    const refs = footerImageRefs(footer)
    assert.deepEqual(refs, [backgroundImage, rowImage, itemImage, itemImageDark])
  })

  test('is empty on an undefined footer', () => {
    assert.deepEqual(footerImageRefs(undefined), [])
  })
})

test.describe('footerLinkItems', () => {
  test('collects items from links and buttons blocks separately', () => {
    const { links, buttons } = footerLinkItems(footer)
    assert.equal(links.length, 1)
    assert.equal(links[0].type, 'standard')
    assert.equal(buttons.length, 1)
    assert.equal(buttons[0].type, 'external')
  })

  test('is empty on an undefined footer', () => {
    const { links, buttons } = footerLinkItems(undefined)
    assert.deepEqual(links, [])
    assert.deepEqual(buttons, [])
  })
})
