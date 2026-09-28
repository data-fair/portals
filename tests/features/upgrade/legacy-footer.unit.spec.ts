import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { migrateLegacyFooter, type LegacyFooter } from '../../../upgrade/2.33.1/footer-rows.ts'
import type { Footer } from '../../../api/types/portal-config-footer/index.ts'
import { footerRowColumns } from '../../../api/types/portal-config-footer/walk.ts'
import type { FooterElement } from '../../../api/types/footer-elements/index.ts'

const blocks = (footer: Footer, row = 0, column = 0) => footerRowColumns(footer.rows[row]!)[column] ?? []
const types = (elements: FooterElement[]) => elements.map(e => e.type)

const image = { _id: 'img1', name: 'img.png', mimeType: 'image/png' }
const base: LegacyFooter = { color: 'primary', copyright: 'text', logoPrimaryType: 'hidden', extraLogos: [], linksMode: 'lines', links: [], importantLinks: [], socialPosition: 'none' }

test.describe('legacy footer converter', () => {
  test('copyright logo adds a koumoul item to the extra logos of a non white label portal', () => {
    const footer = migrateLegacyFooter({ ...base, copyright: 'logo', extraLogos: [{ logo: image, label: 'Partner' }] }, false)
    assert.equal(footer.copyright, false)
    const logos = blocks(footer)[0] as Extract<FooterElement, { type: 'images' }>
    assert.deepEqual(logos.items.map(i => i.source), ['upload', 'koumoul'])
  })

  test('copyright logo alone (no extra logos) still emits the koumoul images block', () => {
    const footer = migrateLegacyFooter({ ...base, copyright: 'logo' }, false)
    assert.deepEqual(types(blocks(footer)), ['images'])
  })

  test('background image and location are carried over', () => {
    const footer = migrateLegacyFooter({ ...base, backgroundImage: image, backgroundImageLocation: 'repeat' }, false)
    assert.deepEqual(footer.background, { color: 'primary', image, imageLocation: 'repeat' })
  })

  test('global and header logo types map to the matching sources', () => {
    assert.equal((blocks(migrateLegacyFooter({ ...base, logoPrimaryType: 'default' }, false))[0] as any).items[0].source, 'global')
    assert.equal((blocks(migrateLegacyFooter({ ...base, logoPrimaryType: 'header' }, false))[0] as any).items[0].source, 'header')
  })

  test('local logo type without an uploaded image emits no logo block', () => {
    assert.deepEqual(types(blocks(migrateLegacyFooter({ ...base, logoPrimaryType: 'local' }, false))), [])
  })

  test('text in the left column creates the two-column layout', () => {
    const footer = migrateLegacyFooter({ ...base, text: 'hello', textPosition: 'left' }, false)
    assert.equal(footer.rows[0].columns, 2)
    assert.equal(footer.rows[0].disposition, 'right')
    assert.deepEqual(types(blocks(footer, 0, 0)), ['text'])
  })

  test('legacy showSocial without socialPosition means main', () => {
    const footer = migrateLegacyFooter({ ...base, socialPosition: undefined, showSocial: true } as LegacyFooter, false)
    assert.deepEqual(types(blocks(footer)), ['social'])
  })

  test('an empty legacy footer gives one row with one empty column', () => {
    const footer = migrateLegacyFooter(base, false)
    assert.equal(footer.rows.length, 1)
    assert.deepEqual(footer.rows[0], { columns: 1, blocks: [] })
  })

  test('spacing reproduces the legacy template', () => {
    const footer = migrateLegacyFooter({ ...base, logoPrimaryType: 'default', slogan: 's', socialPosition: 'main', links: [{ type: 'standard', subtype: 'sitemap' }], importantLinks: [{ type: 'standard', subtype: 'contact' }] }, false)
    assert.deepEqual(blocks(footer).map(b => b.mb), [4, 4, 4, 0])
    assert.deepEqual(blocks(footer, 1).map(b => b.mb), [2, 2, 2])
  })
})
