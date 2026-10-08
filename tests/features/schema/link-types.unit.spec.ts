import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { eventPage, newsPage, standardPage } from '../../../api/types/common-links/schema.js'

// Judged simulations, with both models: a person and the assistant read the menu option
// « Page d'événements » as the place for an agenda of all events, but it links to one event
// page; the page creation wizard names that type « Page d'événement ». The menu says the same.
test.describe('the link types to a single page', () => {
  test('are named in the singular, as in the page creation wizard', () => {
    expect(eventPage.title).toBe("Page d'événement")
    expect(newsPage.title).toBe("Page d'actualité")
    const source = readFileSync(new URL('../../../api/types/common-links/schema.js', import.meta.url), 'utf8')
    expect(source).not.toContain("Page d'événements")
    expect(source).not.toContain("Page d'actualités")
  })

  test('a standard page item has no page type until one is chosen', () => {
    // a judged run: choosing « Page standard » filled « Type de page » with « Accueil », the row
    // was valid, « Valider le brouillon » lit up and the preview showed a second « Accueil »; a
    // person stopping there would have published a duplicate home link
    expect((standardPage.properties.subtype as any).default).toBeUndefined()
    const source = readFileSync(new URL('../../../api/types/common-links/schema.js', import.meta.url), 'utf8')
    expect(source).not.toContain("default: 'home'")
  })
})
