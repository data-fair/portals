import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { freezePortalConfig, freezePageConfig } from '../../../upgrade/2.38.0/freeze-missing-defaults.ts'

test.describe('freeze missing config defaults migration', () => {
  test('writes the values a portal config rendered without its keys', () => {
    const config: Record<string, any> = {
      header: { show: true, logoPrimaryMobile: { _id: 'm' } },
      navBar: {},
      breadcrumb: { position: 'below-nav', showHome: true },
      menu: { children: [{ type: 'external', title: 'Site', href: 'https://example.com' }] },
      datasets: { card: { thumbnail: { show: true } }, page: { metadata: { location: 'right' } } },
      applications: { card: { showSummary: true, ownerDisplay: 'avatarName' }, page: {} },
      reuses: { card: {}, page: {} },
      events: { card: {} },
      news: { card: { thumbnail: { show: true, location: 'top' } } }
    }
    assert.equal(freezePortalConfig(config), true)
    assert.deepEqual(config.header, { show: true, showTitle: false, logoPrimaryType: 'local', logoPrimaryMobile: { _id: 'm' } })
    assert.deepEqual(config.navBar, {})
    assert.deepEqual(config.breadcrumb, { position: 'below-nav', showHome: true, fluid: false, compact: false })
    assert.deepEqual(config.navLinksConfig, { showIcon: false, uppercase: false })
    assert.deepEqual(config.defaults, { density: 'default' })
    assert.equal(config.menu.children[0].target, false)
    assert.deepEqual(config.datasets.card, {
      actionsLocation: 'none',
      actionsStyle: 'text',
      titleLinesCount: 1,
      showSummary: false,
      ownerDisplay: 'none',
      thumbnail: { show: false, crop: false }
    })
    assert.deepEqual(config.applications.card.showSummary, true)
    assert.deepEqual(config.applications.card.ownerDisplay, 'avatarName')
    assert.deepEqual(config.reuses.card, { titleLinesCount: 1, showSummary: false, showAuthor: false, thumbnail: { show: false, crop: false } })
    assert.deepEqual(config.news.card, { titleLinesCount: 1, showDescription: false, thumbnail: { show: true, location: 'top', crop: false } })
    assert.deepEqual(config.datasets.page, {
      metadata: { location: 'right', actionsStyle: 'text', showDepartment: false },
      topics: { show: false, showIcon: false },
      keywords: { show: false },
      applications: { display: 'none' },
      relatedDatasets: { display: 'none', columns: 3 }
    })
    assert.deepEqual(config.reuses.page, { showImage: false, datasets: { display: 'none' } })
    assert.equal(freezePortalConfig(config), false)
  })

  test('writes the values page blocks rendered without their keys, nested ones included', () => {
    const config: Record<string, any> = {
      elements: [
        { type: 'title', content: 'a', titleSize: 'h2', anchor: { enabled: true } },
        { type: 'text', content: 'b', mb: 0 },
        {
          type: 'tabs',
          align: 'start',
          tabs: [{ title: 't', children: [{ type: 'button', link: { type: 'external', title: 'x', href: 'https://x.org' }, config: { color: 'primary' } }] }]
        },
        { type: 'datasets-list', columns: 3, limit: 3, usePortalConfig: false, cardConfig: { showSummary: true } },
        { type: 'contact', additionalFields: [{ type: 'text', label: 'Name' }] },
        { type: 'divider', opacity: 0.1, thickness: 1 }
      ]
    }
    assert.equal(freezePageConfig(config), true)
    const [title, text, tabs, list, contact, divider] = config.elements
    assert.deepEqual(title.anchor, { enabled: true, inToc: false })
    assert.equal(title.mb, undefined)
    assert.equal(text.mb, 0)
    assert.equal(tabs.mb, undefined)
    assert.equal(tabs.border, false)
    assert.deepEqual(tabs.tabs[0].children[0], {
      type: 'button',
      link: { type: 'external', title: 'x', href: 'https://x.org', target: false },
      config: { color: 'primary' },
      centered: false,
      usePortalConfig: false
    })
    assert.equal(list.cardConfig.showSummary, true)
    assert.equal(list.cardConfig.actionsLocation, 'none')
    assert.deepEqual(contact.additionalFields, [{ type: 'text', label: 'Name' }])
    assert.deepEqual(contact.defaultFields, { messageMaxLength: 3000 })
    assert.deepEqual(divider, { type: 'divider', opacity: 0.1, thickness: 1, rounded: false })
    assert.equal(freezePageConfig(config), false)
  })

  test('keeps the Vuetify density of a search block without density', () => {
    const config: Record<string, any> = { elements: [{ type: 'search' }, { type: 'search', density: 'compact' }] }
    assert.equal(freezePageConfig(config), true)
    assert.deepEqual(config.elements.map((e: any) => e.density), ['default', 'compact'])
  })
})
