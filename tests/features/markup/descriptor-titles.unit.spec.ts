import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { tagDescriptors } from '../../../shared/markup/tag-descriptors.ts'

test.describe('generated tag descriptors', () => {
  test('title element has localized titles', () => {
    const titleDesc = tagDescriptors.title
    assert.ok(titleDesc, 'title descriptor exists')
    assert.ok(titleDesc.titles, 'titles populated')
    assert.ok(titleDesc.titles.en, 'english title present')
    assert.ok(titleDesc.titles.fr, 'french title present')
  })

  test('at least one attribute carries titles', () => {
    const titleDesc = tagDescriptors.title
    const attrWithTitles = titleDesc.attributes.find(a => a.titles)
    assert.ok(attrWithTitles, 'at least one attribute should carry titles')
  })

  test('titleSize enum carries per-value titles', () => {
    const titleDesc = tagDescriptors.title
    const titleSize = titleDesc.attributes.find(a => a.name === 'titleSize')
    assert.ok(titleSize, 'titleSize attribute exists')
    assert.ok(titleSize!.enumTitles, 'enumTitles populated on titleSize')
    const h1Titles = titleSize!.enumTitles!.h1
    assert.ok(h1Titles, 'h1 branch has titles')
    assert.ok(Object.keys(h1Titles).length > 0, 'h1 title is non-empty')
  })
})
