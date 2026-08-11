import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { findActiveMenuIndex, resolveMenuLink } from '../../../portal/app/utils/nav-active.ts'
import type { MenuItem } from '../../../api/types/portal/index.ts'

// Minimal builders — casts keep the literals free of the full generated shapes.
const generic = (slug: string, groupSlug?: string): MenuItem =>
  ({ type: 'generic', pageRef: { slug, title: slug, ...(groupSlug ? { group: { _id: groupSlug, slug: groupSlug, title: groupSlug } } : {}) } }) as unknown as MenuItem

const standard = (subtype: string): MenuItem =>
  ({ type: 'standard', subtype }) as unknown as MenuItem

test.describe('resolveMenuLink', () => {
  test('a generic page in a group resolves to /pages-<group>/<slug>', () => {
    assert.equal(resolveMenuLink(generic('gestion-de-lorganisation', 'administration')), '/pages-administration/gestion-de-lorganisation')
  })

  test('a generic page without a group resolves to /pages/<slug>', () => {
    assert.equal(resolveMenuLink(generic('tous-les-cours')), '/pages/tous-les-cours')
  })
})

test.describe('findActiveMenuIndex', () => {
  test('highlights the tab whose link matches the current path', () => {
    const nav = [standard('home'), generic('tous-les-cours'), generic('contact-slug')]
    assert.equal(findActiveMenuIndex(nav, '/pages/tous-les-cours'), 1)
  })

  test('keeps prefix matching for section pages (e.g. /datasets/<id>)', () => {
    const nav = [standard('home'), standard('datasets')]
    assert.equal(findActiveMenuIndex(nav, '/datasets/some-dataset'), 1)
  })

  test('highlights the group root-page tab for a sub-page of that group', () => {
    // "Tous les cours" (index 0) then "Parcours administrateur" (index 1, the group root page).
    // gestion-de-lorganisation is a sub-page of the "administration" group and no tab links to it directly,
    // so the group's root-page tab must light up — not the first tab.
    const nav = [generic('tous-les-cours'), generic('parcours-administration')]
    assert.equal(findActiveMenuIndex(nav, '/pages-administration/gestion-de-lorganisation', '/pages/parcours-administration'), 1)
  })

  test('a sub-page listed in the menu wins over its group root-page tab', () => {
    const nav = [
      generic('parcours-administration'), // the group root-page tab (index 0)
      generic('gestion-de-lorganisation', 'administration') // the sub-page itself, in the menu (index 1)
    ]
    assert.equal(findActiveMenuIndex(nav, '/pages-administration/gestion-de-lorganisation', '/pages/parcours-administration'), 1)
  })

  test('returns undefined when nothing matches and there is no group', () => {
    const nav = [standard('home'), generic('tous-les-cours')]
    assert.equal(findActiveMenuIndex(nav, '/pages/unknown'), undefined)
  })
})
