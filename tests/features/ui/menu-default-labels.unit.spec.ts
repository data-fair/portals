import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

// Judged simulations: a menu entry to the events catalogue without a « Libellé » read
// « Événement », in the singular, in the editor's preview and on the published portal, for a
// page that lists every event. The news catalogue's default was already plural.
test.describe('the default label of a menu entry to the events catalogue', () => {
  for (const file of ['ui/src/composables/use-navigation-store.ts', 'portal/app/composables/use-navigation-store.ts']) {
    test(`is plural in ${file}`, () => {
      const source = readFileSync(new URL(`../../../${file}`, import.meta.url), 'utf8')
      expect(source).toContain("eventPage: 'Événements'")
      expect(source).toContain("eventPage: 'Events'")
    })
  }
})
