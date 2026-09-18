import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { migrateLegacyFooter, type LegacyFooter } from '../../../upgrade/2.33.1/footer-rows.ts'
import type { Footer } from '../../../api/types/portal-config-footer/index.ts'
import { footerRowColumns } from '../../../api/types/portal-config-footer/walk.ts'
import type { FooterElement } from '../../../api/types/footer-elements/index.ts'

const fixturesDir = join(import.meta.dirname, '../../resources/legacy-footers')
const fixtures = readdirSync(fixturesDir).map(file => JSON.parse(readFileSync(join(fixturesDir, file), 'utf8')) as { name: string, whiteLabel: boolean, footer: LegacyFooter })
const byName = (name: string) => fixtures.find(f => f.name === name)!

const blocks = (footer: Footer, row = 0, column = 0) => footerRowColumns(footer.rows[row]!)[column] ?? []
const types = (elements: FooterElement[]) => elements.map(e => e.type)

const image = { _id: 'img1', name: 'img.png', mimeType: 'image/png' }
const base: LegacyFooter = { color: 'primary', copyright: 'text', logoPrimaryType: 'hidden', extraLogos: [], linksMode: 'lines', links: [], importantLinks: [], socialPosition: 'none' }

test.describe('legacy footer converter', () => {
  test('every production fixture converts to a valid rows footer', () => {
    for (const fixture of fixtures) {
      const footer = migrateLegacyFooter(fixture.footer, fixture.whiteLabel)
      assert.equal(typeof footer.copyright, 'boolean', fixture.name)
      assert.equal(footer.background.color, fixture.footer.color, fixture.name)
      assert.ok(footer.rows.length >= 1, fixture.name)
      for (const row of footer.rows) {
        assert.ok(row.columns === 1 || row.columns === 2, fixture.name)
        assert.equal(row.blocks3, undefined, fixture.name)
        for (const column of footerRowColumns(row)) assert.ok(column.length >= 1 || footer.rows.length === 1, fixture.name)
      }
    }
  })

  test('edf: local logo and slogan in the left column, links in columns in the main one', () => {
    const footer = migrateLegacyFooter(byName('opendata-edf-fr').footer, false)
    assert.equal(footer.rows.length, 1)
    assert.equal(footer.rows[0].columns, 2)
    assert.equal(footer.rows[0].disposition, 'right')
    assert.deepEqual(types(blocks(footer, 0, 0)), ['images', 'text'])
    const logo = blocks(footer, 0, 0)[0] as Extract<FooterElement, { type: 'images' }>
    assert.equal(logo.height, 80)
    assert.equal(logo.items[0].source, 'upload')
    assert.equal(logo.items[0].link, '/')
    const slogan = blocks(footer, 0, 0)[1] as Extract<FooterElement, { type: 'text' }>
    assert.equal(slogan.markdown, false)
    assert.equal(slogan.content, 'L’énergie est notre avenir économisons-la !')
    assert.deepEqual(types(blocks(footer, 0, 1)), ['links'])
    assert.equal((blocks(footer, 0, 1)[0] as any).display, 'columns')
  })

  test('poitiers: centered logo, social links and important links as a second row', () => {
    const footer = migrateLegacyFooter(byName('data-grandpoitiers-fr').footer, false)
    assert.equal(footer.rows.length, 2)
    assert.equal(footer.rows[0].columns, 1)
    assert.deepEqual(types(blocks(footer)), ['images', 'social', 'links'])
    assert.equal(blocks(footer)[0].align, 'center')
    assert.deepEqual(types(blocks(footer, 1)), ['divider', 'buttons', 'divider'])
    assert.equal((blocks(footer, 1)[1] as any).items.length, 4)
    assert.equal((blocks(footer, 1)[1] as any).variant, 'text')
  })

  test('cines: hidden logo, social in the left column, extra logos without links', () => {
    const footer = migrateLegacyFooter(byName('datacinesindes-fr').footer, false)
    assert.equal(footer.rows[0].columns, 2)
    assert.equal(footer.rows[0].disposition, 'right')
    assert.deepEqual(types(blocks(footer, 0, 0)), ['social'])
    assert.deepEqual(types(blocks(footer, 0, 1)), ['images', 'links'])
    const logos = blocks(footer, 0, 1)[0] as Extract<FooterElement, { type: 'images' }>
    assert.equal(logos.height, 40)
    assert.equal(logos.items.length, 2)
    assert.equal(logos.items[0].link, undefined)
    assert.equal(logos.items[0].label, 'Avec le soutien du Centre national du cinéma et de l’image animée - Diffusion 15/25')
  })

  test('corse: markdown text in the main column keeps its rendered html', () => {
    const fixture = byName('data-corsica')
    const footer = migrateLegacyFooter(fixture.footer, false)
    const text = blocks(footer, 0, 1).find(b => b.type === 'text') as Extract<FooterElement, { type: 'text' }>
    assert.equal(text.markdown, true)
    assert.equal(text.content, fixture.footer.text)
    assert.equal(text.content_html, fixture.footer.text_html)
    const logo = blocks(footer, 0, 0)[0] as Extract<FooterElement, { type: 'images' }>
    assert.equal(logo.items[0].link, 'https://www.isula.corsica')
    assert.ok(logo.items[0].imageDark)
  })

  test('laposte (white label): copyright stays true and no koumoul item is emitted', () => {
    const footer = migrateLegacyFooter({ ...byName('data-laposte-fr').footer, copyright: 'logo' }, true)
    assert.equal(footer.copyright, true)
    for (const row of footer.rows) {
      for (const column of footerRowColumns(row)) {
        for (const block of column) {
          if (block.type === 'images') assert.ok(!block.items.some(i => i.source === 'koumoul'))
        }
      }
    }
  })

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
