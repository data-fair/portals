import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { eventText, joinEventTexts } from '../../../api/src/utils/event-texts.ts'

test.describe('event texts', () => {
  test('an event title exists in french and english', () => {
    assert.deepEqual(eventText('page-draft-validate', { title: 'Accueil' }), {
      fr: 'Le brouillon de la page Accueil a été validé',
      en: 'The draft of the page Accueil was validated'
    })
  })

  test('details are joined language by language', () => {
    const details = joinEventTexts([eventText('pageType', { type: 'generic' }), eventText('pageGroup', { group: 'G' })], '; ')
    assert.deepEqual(details, { fr: 'Type : generic; Groupe : G', en: 'Type: generic; Group: G' })
    assert.equal(joinEventTexts([], '; '), undefined)
  })
})
